export const daiAddress = process.env.NEXT_PUBLIC_DAI_ADDRESS
export const uniswapRouterAddress = process.env.NEXT_PUBLIC_UNISWAP_ROUTER_ADDRESS
export const fixedDigits = 4
export const transactionTimeLimitInSeconds = 30 * 60 // 30 minutes
export const environment = process.env.NODE_ENV
export const isDevelopment = environment === 'development'
export const isProduction = environment === 'production'
export const networkName = isProduction ? 'Ethereum Mainnet' : 'Ropsten Testnet'
export const networkChainId = isProduction ? 1 : 3
