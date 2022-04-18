import { formatNumber, shortenWalletAddress, wei2Number } from '../helper';
import { ethers } from 'ethers';

test('shortenWalletAddress', async () => {
  expect(shortenWalletAddress('')).toBe('')
  expect(shortenWalletAddress('0xabcd')).toBe('0xabcd')
  expect(shortenWalletAddress('0xabcd00abc')).toBe('0xabcd00abc')
  expect(shortenWalletAddress('0xabcd00abcd')).toBe('0xabcd...abcd')
  expect(shortenWalletAddress('0xabcd1234abcd1234')).toBe('0xabcd...1234')
})

test('formatNumber', async () => {
  expect(formatNumber(100)).toBe('100.0000')
  expect(formatNumber(1.234)).toBe('1.2340')
  expect(formatNumber(1.23456)).toBe('1.2346')
  expect(formatNumber(1.23454)).toBe('1.2345')
})

test('wei2Number', async () => {
  expect(wei2Number(ethers.utils.parseEther('1.0'))).toBe(1)
  expect(wei2Number(ethers.utils.parseEther('0.12345'))).toBe(0.12345)
})
