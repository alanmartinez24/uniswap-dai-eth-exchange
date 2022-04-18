import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

const TEST_PRIVATE_KEY = '0x7ab8a2d88293d94d6a7979465dcf1b43b3249999b4a156e993aac88161f812be'

// sets up the injected provider to be a mock ethereum provider with the given mnemonic/index
// eslint-disable-next-line no-undef
Cypress.Commands.overwrite('visit', (original, url, options) => {
  return original(url, {
    ...options,
    onBeforeLoad(win) {
      options && options.onBeforeLoad && options.onBeforeLoad(win)
      win.localStorage.clear()
      const provider = new JsonRpcProvider('https://ropsten.infura.io/v3/c4ee8955ba6b4b53ade46898b799aa69', 3)
      const signer = new Wallet(TEST_PRIVATE_KEY, provider)
      win.ethereum = new Eip1193Bridge(signer, provider)
    },
  })
})
