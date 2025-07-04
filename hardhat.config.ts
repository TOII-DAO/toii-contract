import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import * as dotenv from 'dotenv'
import { HardhatUserConfig } from 'hardhat/config'
dotenv.config({ path: __dirname + '/.env' })

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.27',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    arbitrum: {
      url: 'https://rpc.ankr.com/arbitrum/dc3359a3d6c4f6866d0e59e41b886d8806cba7197232edf7412c79644595b948',
      accounts: process.env.PR_KEY ? [process.env.PR_KEY] : []
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PR_KEY ? [process.env.PR_KEY] : [],
      timeout: 60000
    }
  },
  paths: {
    sources: './src',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  mocha: {
    timeout: 40000
  },
  etherscan: {
    apiKey: {
      arbitrum: process.env.ARBITRUM_API_KEY || '',
      sepolia: process.env.SEPOLIA_API_KEY || ''
    },
    customChains: [
      {
        network: 'arbitrum',
        chainId: 42161,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://arbitrum.llamarpc.com/'
        }
      },
      {
        network: 'sepolia',
        chainId: 11155111,
        urls: {
          apiURL: 'https://api-sepolia.etherscan.io/api',
          browserURL: 'https://sepolia.etherscan.io/'
        }
      }
    ]
  }
}

export default config
