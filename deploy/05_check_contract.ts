import { hardhatArguments } from 'hardhat'
import { getConfig, initConfig } from './utils'

async function main() {
  const { ethers } = await import('hardhat')
  await initConfig()
  const network = hardhatArguments.network ? hardhatArguments.network : 'dev'
  const config = getConfig()

  if (!config[network]) {
    console.error(`No deployment found for network: ${network}`)
    return
  }

  console.log(`Checking contract on ${network}...`)

  try {
    // Get contract instance
    const token = await ethers.getContractAt('ToiiNetwork', config[network].ToiiNetworkProxy)
    
    // Check basic info
    console.log('\n📋 Contract Information:')
    console.log(`Name: ${await token.name()}`)
    console.log(`Symbol: ${await token.symbol()}`)
    console.log(`Decimals: ${await token.decimals()}`)
    console.log(`Total Supply: ${await token.totalSupply()}`)
    console.log(`Transfer Fee: ${await token.transferFee()}`)
    
    // Check owner
    const owner = await token.owner()
    console.log(`Owner: ${owner}`)
    
    // Check if owner is excluded from fee
    const isExcluded = await token.isExcludedFromFee(owner)
    console.log(`Owner excluded from fee: ${isExcluded}`)
    
    console.log('\n✅ Contract is working correctly!')
    console.log(`\n🎯 Main contract address: ${config[network].ToiiNetworkProxy}`)
    console.log(`🌐 Etherscan: https://sepolia.etherscan.io/address/${config[network].ToiiNetworkProxy}`)

  } catch (error) {
    console.error('❌ Error checking contract:', error)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}) 