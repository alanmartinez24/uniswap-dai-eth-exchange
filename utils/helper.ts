import { daiAddress, fixedDigits } from '../const';
import { IUniswapV2Router02 } from '../types/ethers-contracts';
import { BigNumberish, ethers } from 'ethers';

export const shortenWalletAddress = (address: string) => {
  if (!address) return ''

  if (address.length < 12) {
    return address
  }

  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export const formatNumber = (number: number) => {
  return number.toFixed(fixedDigits)
}

export const wei2Number = (wei: BigNumberish): number => {
  return Number(ethers.utils.formatEther(wei))
}

export const getUniswapEthOutput = async (router: IUniswapV2Router02, daiAmount: number) => {
  const wethAddress = await router.WETH()
  const outputPath = await router.getAmountsOut(
    ethers.utils.parseEther(String(daiAmount)),
    [
      daiAddress,
      wethAddress
    ]
  )

  const outputAmount = outputPath.at(-1)

  return Number(ethers.utils.formatEther(outputAmount!))
}

export const getUniswapDaiOutput = async (router: IUniswapV2Router02, ethAmount: number) => {
  const wethAddress = await router.WETH()
  const outputPath = await router.getAmountsOut(
    ethers.utils.parseEther(String(ethAmount)),
    [
      wethAddress,
      daiAddress
    ]
  )

  const outputAmount = outputPath.at(-1)

  return Number(ethers.utils.formatEther(outputAmount!))
}
