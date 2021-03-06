# DAI/ETH Trading UI

## Summary
This project demonstrates the usage of web3/ethers to interact with Smart Contracts by implementing trading UI using Uniswap V2.<br>
*Note: It does not use Uniswap SDK.

## Tech Stack
- React 18
- Next.js framework
- Material UI 5
- Ethers
- TypeChain

## Networks
The project interacts with Ropsten Testnet.

## Node Version & Package Manager
- The project runs on Node.js >= 14
- The project uses `yarn` as package manager.

## Getting Started

First, you need to install dependencies by running

```bash
yarn install
```

Then, you need to run server in development environment by running

```bash
yarn dev
```

As a result, you will see a server running at `http://localhost:3000`

## Test
You can run unit tests by running
```bash
yarn test
```

You can run e2e tests by running
```bash
yarn cypress:run
```

## Usage of TypeChain
All ABI files are stored in `abi` directory, whenever you make changes, you need to run
```bash
yarn generate-types
```
to use types of Smart Contracts.

## Deployment
The project is hosted on Netlify now.<br>
You can visit [here](https://625de1cc5b75a800ab00187f--voluble-narwhal-4dbfda.netlify.app/) to test out the app on Ropsten Testnet.
