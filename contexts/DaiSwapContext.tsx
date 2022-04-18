import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'

import { useWallet } from './WalletContext'
import {
  Dai__factory,
  IUniswapV2Factory__factory,
  IUniswapV2Pair__factory,
  IUniswapV2Router02__factory
} from '../types/ethers-contracts'
import { daiAddress, transactionTimeLimitInSeconds, uniswapRouterAddress } from '../const';
import { getUniswapDaiOutput, getUniswapEthOutput } from '../utils/helper';
import useNotification from '../hooks/useNotification';
import {
  ERROR_APPROVE_DAI,
  ERROR_TRANSACTION_FAILED,
  ERROR_WALLET_NOT_CONNECTED,
  MESSAGE_TRANSACTION_CONFIRMED, MESSAGE_TRANSACTION_SUBMITTED
} from '../const/messages';

interface DaiSwapContextInterface {
  getEthOutput: (daiAmount: number) => Promise<number>;
  getDaiOutput: (ethAmount: number) => Promise<number>;
  swapDaiWithEth: (daiAmount: number) => Promise<void>;
  ethPrice: number | null;
  daiPrice: number | null;
}

const defaultContext = {
  getEthOutput: () => Promise.resolve(0),
  getDaiOutput: () => Promise.resolve(0),
  swapDaiWithEth: () => Promise.resolve(),
  ethPrice: null,
  daiPrice: null
}

const DaiSwapContext = React.createContext<DaiSwapContextInterface>(defaultContext)

interface DaiSwapContextProviderProps {
  children?: ReactNode
}

export const DaiSwapContextProvider: FC<DaiSwapContextProviderProps> = ({ children }) => {
  const { provider, walletAddress } = useWallet()
  const { notifyError, notifySuccess } = useNotification()

  const [isInUpdateUnitPrice, setIsInUpdateUnitPrice] = useState(false)
  const [ethPrice, setEthPrice] = useState<number>(null) // ETH price in DAI
  const [daiPrice, setDaiPrice] = useState<number>(null) // DAI price in ETH

  // Update unit price
  const updateUnitPrice = async () => {
    if (!provider || isInUpdateUnitPrice) {
      return
    }

    setIsInUpdateUnitPrice(true)

    const router = IUniswapV2Router02__factory.connect(uniswapRouterAddress, provider!)

    setEthPrice(await getUniswapDaiOutput(router, 1))
    setDaiPrice(await getUniswapEthOutput(router, 1))

    setIsInUpdateUnitPrice(false)
  }

  const getEthOutput = useCallback(async (daiAmount: number) => {
    if (!provider) return null
    if (daiAmount === 0) return 0

    const router = IUniswapV2Router02__factory.connect(uniswapRouterAddress, provider!)

    return await getUniswapEthOutput(router, daiAmount)
  }, [provider])

  const getDaiOutput = useCallback(async (ethAmount: number) => {
    if (!provider) return null
    if (ethAmount === 0) return 0

    const router = IUniswapV2Router02__factory.connect(uniswapRouterAddress, provider!)

    return await getUniswapDaiOutput(router, ethAmount)
  }, [provider])

  const swapDaiWithEth = useCallback(async (daiAmount: number) => {
    if (!provider) {
      notifyError(ERROR_WALLET_NOT_CONNECTED)
      return
    }

    const routerContract = IUniswapV2Router02__factory.connect(uniswapRouterAddress, provider!.getSigner())
    const swapAmount = ethers.utils.parseEther(String(daiAmount))
    const daiContract = Dai__factory.connect(daiAddress, provider!.getSigner())

    // Check token(DAI) allowance for the router
    const allowedAmount = await daiContract.allowance(walletAddress!, uniswapRouterAddress)

    if (allowedAmount < swapAmount) {
      try {
        const transaction = await daiContract.approve(uniswapRouterAddress, ethers.constants.MaxInt256)
        await transaction.wait()
      } catch (err) {
        notifyError(ERROR_APPROVE_DAI)

        return
      }
    }

    const wethAddress = await routerContract.WETH()
    const swapPath = [daiAddress, wethAddress]
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const deadline = currentTimestamp + transactionTimeLimitInSeconds

    try {
      const transaction = await routerContract.swapExactTokensForETH(
        swapAmount,
        ethers.utils.parseEther('0'),
        swapPath,
        walletAddress!,
        deadline
      )

      notifySuccess(MESSAGE_TRANSACTION_SUBMITTED)

      await transaction.wait()

      notifySuccess(MESSAGE_TRANSACTION_CONFIRMED)
    } catch (err) {
      notifyError(err.message || ERROR_TRANSACTION_FAILED)
    }
  }, [provider])

  // Initialize contracts and parameters from the provider.
  useEffect(() => {
    if (!provider) {
      return
    }

    (async function() {

      const router = IUniswapV2Router02__factory.connect(uniswapRouterAddress, provider)
      const wethAddress = await router.WETH()

      const factoryAddress = await router.factory()
      const factory = IUniswapV2Factory__factory.connect(factoryAddress, provider)

      const pairAddress = await factory.getPair(wethAddress, daiAddress)
      const pair = IUniswapV2Pair__factory.connect(pairAddress, provider)

      pair.on('Swap', updateUnitPrice)

      await updateUnitPrice()
    })()
  }, [provider])

  return (
    <DaiSwapContext.Provider
      value={{
        getEthOutput,
        getDaiOutput,
        swapDaiWithEth,
        ethPrice,
        daiPrice
      }}
    >
      {children}
    </DaiSwapContext.Provider>
  )
}

export const useDaiSwap = () => React.useContext(DaiSwapContext)
