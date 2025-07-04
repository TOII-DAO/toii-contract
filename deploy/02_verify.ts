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
  console.log('SEPOLIA API KEY:', process.env.SEPOLIA_API_KEY)
  console.log(`Verifying contracts on ${network}...`)

  try {
    // Verify Implementation
    console.log('Verifying Implementation...')
    await hre.default.run('verify:verify', {
      address: config[network].ToiiNetworkImplementation,
      constructorArguments: [],
    })
    console.log('✅ Implementation verified')

    // Verify Beacon
    console.log('Verifying Beacon...')
    await hre.default.run('verify:verify', {
      address: config[network].ToiiNetworkBeacon,
      constructorArguments: [config[network].ToiiNetworkImplementation],
    })
    console.log('✅ Beacon verified')

    // Verify Proxy (this will verify the proxy and link to implementation)
    console.log('Verifying Proxy...')
    // Get the deployer address
    const [deployer] = await ethers.getSigners()
    const initialOwner = process.env.INITIAL_OWNER || deployer.address
    await hre.default.run('verify:verify', {
      address: config[network].ToiiNetworkProxy,
      constructorArguments: [
        config[network].ToiiNetworkBeacon,
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['address'],
          [initialOwner]
        )
      ],
    })
    console.log('✅ Proxy verified')

    console.log('\n🎉 All contracts verified successfully!')
    console.log(`\nContract addresses on ${network}:`)
    console.log(`Token (Proxy): ${config[network].ToiiNetworkProxy}`)
    console.log(`Implementation: ${config[network].ToiiNetworkImplementation}`)
    console.log(`Beacon: ${config[network].ToiiNetworkBeacon}`)
    console.log(`Beacon Owner: ${config[network].ToiiNetworkBeaconOwner}`)

  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}) 