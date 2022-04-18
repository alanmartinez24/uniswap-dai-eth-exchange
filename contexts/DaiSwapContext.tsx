import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'

import { useWallet } from './WalletContext'
import {
  Dai__factory,
  IUniswapV2Factory__factory,
  IUniswapV2Pair__factory,
  IUniswapV2Router02,
  IUniswapV2Pair,
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
  ready: boolean;
}

const defaultContext = {
  getEthOutput: () => Promise.resolve(0),
  getDaiOutput: () => Promise.resolve(0),
  swapDaiWithEth: () => Promise.resolve(),
  ethPrice: null,
  daiPrice: null,
  ready: false
}

const DaiSwapContext = React.createContext<DaiSwapContextInterface>(defaultContext)

interface DaiSwapContextProviderProps {
  children?: ReactNode
}

export const DaiSwapContextProvider: FC<DaiSwapContextProviderProps> = ({ children }) => {
  const { provider, walletAddress } = useWallet()
  const { notifyError, notifySuccess } = useNotification()

  const [ready, setReady] = useState(false)
  const [isInUpdateUnitPrice, setIsInUpdateUnitPrice] = useState(false)
  const [routerContract, setRouterContract] = useState<IUniswapV2Router02>(null)
  const [pairContract, setPairContract] = useState<IUniswapV2Pair>(null)
  const [ethPrice, setEthPrice] = useState<number>(null) // ETH price in DAI
  const [daiPrice, setDaiPrice] = useState<number>(null) // DAI price in ETH

  // Update unit price
  const updateUnitPrice = async () => {
    if (!routerContract || isInUpdateUnitPrice) {
      return
    }

    setIsInUpdateUnitPrice(true)

    setEthPrice(await getUniswapDaiOutput(routerContract, 1))
    setDaiPrice(await getUniswapEthOutput(routerContract, 1))

    setIsInUpdateUnitPrice(false)
  }

  const getEthOutput = useCallback(async (daiAmount: number) => {
    if (!ready) return null
    if (daiAmount === 0) return 0

    return await getUniswapEthOutput(routerContract, daiAmount)
  }, [routerContract])

  const getDaiOutput = useCallback(async (ethAmount: number) => {
    if (!ready) return null
    if (ethAmount === 0) return 0

    return await getUniswapDaiOutput(routerContract, ethAmount)
  }, [routerContract])

  const swapDaiWithEth = useCallback(async (daiAmount: number) => {
    if (!routerContract) {
      notifyError(ERROR_WALLET_NOT_CONNECTED)
      return
    }

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
  }, [routerContract])

  // Initialize contracts and parameters from the provider.
  useEffect(() => {
    if (provider) {
      (async function() {
        const router = IUniswapV2Router02__factory.connect(uniswapRouterAddress, provider.getSigner())
        const wethAddress = await router.WETH()

        const factoryAddress = await router.factory()
        const factory = IUniswapV2Factory__factory.connect(factoryAddress, provider)

        const pairAddress = await factory.getPair(wethAddress, daiAddress)
        const pair = IUniswapV2Pair__factory.connect(pairAddress, provider)

        setRouterContract(router)
        setPairContract(pair)
        setReady(true)
      })()
    } else {
      setRouterContract(null)
      setPairContract(null)
      setReady(false)
    }
  }, [provider])

  // Initialize unit price when contract entity is created.
  useEffect(() => {
    if (routerContract) {
      updateUnitPrice()
    }
  }, [routerContract])

  // Monitor events from Uniswap ETH/DAI pair contract.
  useEffect(() => {
    if (!pairContract) {
      return
    }

    // Whenever swap happens, update prices
    pairContract.on("Swap", () => {
      updateUnitPrice()
    })
  }, [pairContract])

  return (
    <DaiSwapContext.Provider
      value={{
        getEthOutput,
        getDaiOutput,
        swapDaiWithEth,
        ethPrice,
        daiPrice,
        ready
      }}
    >
      {children}
    </DaiSwapContext.Provider>
  )
}

export const useDaiSwap = () => React.useContext(DaiSwapContext)
