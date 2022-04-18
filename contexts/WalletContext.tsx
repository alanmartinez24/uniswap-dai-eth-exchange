import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'

import { Dai__factory } from '../types/ethers-contracts'
import useNotification from '../hooks/useNotification'
import { daiAddress } from '../const';
import { wei2Number } from '../utils/helper';

type Provider = Web3Provider | null;

interface WalletContextInterface {
  provider: Provider;
  connect: () => Promise<Provider>;
  walletAddress: string | null;
  ethBalance: number | null;
  daiBalance: number | null;
  ready: boolean;
}

const defaultContext = {
  provider: null,
  ready: false,
  connect: () => Promise.resolve(null),
  walletAddress: null,
  ethBalance: null,
  daiBalance: null
}

const WalletContext = React.createContext<WalletContextInterface>(defaultContext)

interface WalletContextProviderProps {
  children?: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const { notifyError } = useNotification()

  const [ready, setReady] = useState(false)
  const [provider, setProvider] = useState<Provider>(null)
  const [walletAddress, setWalletAddress] = useState<string>(null)
  const [ethBalance, setEthBalance] = useState<number>(null)
  const [daiBalance, setDaiBalance] = useState<number>(null)

  // Initialize context with provider
  const initializeProvider = useCallback(async (provider: Web3Provider) => {
    const accounts = await provider.listAccounts()

    // If no account is connected to wallet, just ignore the provider.
    if (accounts.length === 0) {
      return
    }

    setWalletAddress(accounts[0])
    setProvider(provider)
    setReady(true)
  }, [])

  // Shows web3 modal for connecting wallet.
  const connect = useCallback(async () => {
    const modal = new Web3Modal()

    try {
      const connection = await modal.connect()
      const provider = new Web3Provider(connection)

      initializeProvider(provider)

      return provider
    } catch (err) {
      console.log(err)
      notifyError('Failed to connect Wallet')
    }

    return null
  }, [])

  // Update ETH/DAI balance.
  const updateBalance = useCallback(async () => {
    const daiContract = Dai__factory.connect(daiAddress, provider!)

    const [eth, dai] = await Promise.all([
      provider!.getBalance(walletAddress),
      daiContract.balanceOf(walletAddress)
    ])

    setEthBalance(wei2Number(eth))
    setDaiBalance(wei2Number(dai))
  }, [provider])

  // Restore provider if wallet had been connected.
  useEffect(() => {
    try {
      const provider = new Web3Provider(window.ethereum, 'any')
      initializeProvider(provider)
    } catch {}
  }, [])

  // Define Event Listeners for the provider.
  useEffect(() => {
    if (!provider) {
      return
    }

    (async function() {
      updateBalance()

      // Monitor ERC20 token transactions to the wallet.
      const topicSetsTo = [
        ethers.utils.id("Transfer(address,address,uint256)"),
        null,
        [
          ethers.utils.hexZeroPad(walletAddress, 32)
        ]
      ]

      provider.on(topicSetsTo, () => {
        updateBalance()
      })

      // Monitor ERC20 token transactions from the wallet.
      const topicSetsFrom = [
        ethers.utils.id("Transfer(address,address,uint256)"),
        [
          ethers.utils.hexZeroPad(walletAddress, 32)
        ]
      ]

      provider.on(topicSetsFrom, () => {
        updateBalance()
      })
    })()

    return () => provider.removeAllListeners()
  }, [provider])

  return (
    <WalletContext.Provider
      value={{
        connect,
        provider,
        walletAddress,
        ethBalance,
        daiBalance,
        ready
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => React.useContext(WalletContext)
