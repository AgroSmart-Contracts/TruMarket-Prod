import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@typechain/hardhat';
import dotenv from 'dotenv';

dotenv.config();

const deployerKey =
  process.env.PRIVATE_KEY || process.env.BLOCKCHAIN_PRIVATE_KEY;
const accounts = deployerKey ? [deployerKey] : [];

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: 'ETH',
    gasPriceApi: 'https://api.etherscan.io/api?module=proxy&action=eth_gasPrice',
    showTimeSpent: true,
    showMethodSig: true,
    noColors: true,
    outputFile: 'gas-report.txt',
  },
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
  networks: {
    hardhat: {
      chainId: 0x7a69, // This is 31337 in decimal
      allowUnlimitedContractSize: true,
      mining: {
        auto: true,
        interval: 0
      },
      forking: process.env.ALCHEMY_API_KEY ? {
        url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: 4600000
      } : undefined
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts,
    },
    amoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts,
    },
    arcTestnet: {
      url: process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network',
      chainId: 5042002,
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.ETHERSCAN_API_KEY as string,
    },
  },
  mocha: {
    timeout: 120000
  }
};

export default config;
