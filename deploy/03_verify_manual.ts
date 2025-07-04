import { hardhatArguments } from 'hardhat'
import { getConfig, initConfig } from './utils'

async function main() {
  const { ethers } = await import('hardhat')
  const hre = await import('hardhat')
  await initConfig()
  const network = hardhatArguments.network ? hardhatArguments.network : 'dev'
  const config = getConfig()

  if (!config[network]) {
    console.error(`No deployment found for network: ${network}`)
    return
  }

  console.log(`Manual verification for ${network}...`)

  try {
    // Verify Implementation only (this should work)
    console.log('Verifying Implementation...')
    await hre.default.run('verify:verify', {
      address: config[network].ToiiNetworkImplementation,
      constructorArguments: [],
    })
    console.log('✅ Implementation verified successfully!')

    console.log('\n📋 Manual verification steps:')
    console.log('1. Go to https://sepolia.etherscan.io/')
    console.log('2. Search for your contract addresses:')
    console.log(`   - Implementation: ${config[network].ToiiNetworkImplementation}`)
    console.log(`   - Beacon: ${config[network].ToiiNetworkBeacon}`)
    console.log(`   - Proxy: ${config[network].ToiiNetworkProxy}`)
    console.log('3. Click "Contract" tab')
    console.log('4. Click "Verify and Publish"')
    console.log('5. Choose "Solidity (Single file)"')
    console.log('6. Upload your contract source code')
    console.log('7. Enter constructor arguments if needed')

    console.log('\n🎯 Main contract to interact with:')
    console.log(`Token Address: ${config[network].ToiiNetworkProxy}`)

  } catch (error) {
    console.error('❌ Verification failed:', error)
    console.log('\n💡 Try manual verification on Etherscan instead.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}) 