import * as dotenv from 'dotenv'
import { hardhatArguments } from 'hardhat'
import { initConfig, setConfig, updateConfig } from './utils'
dotenv.config({ path: __dirname + '/.env' })

async function main() {
  const { ethers } = await import('hardhat')
  await initConfig()
  const network = hardhatArguments.network ? hardhatArguments.network : 'dev'

  console.log('Deploying ToiiNetwork Beacon Pattern...')
  
  // Deploy implementation
  const ToiiNetwork = await ethers.getContractFactory('ToiiNetwork')
  const implementation = await ToiiNetwork.deploy()
  await implementation.waitForDeployment()
  console.log(`Implementation deployed to: ${await implementation.getAddress()}`)

  // Deploy Beacon
  const ToiiNetworkBeacon = await ethers.getContractFactory('ToiiNetworkBeacon')
  const beacon = await ToiiNetworkBeacon.deploy(await implementation.getAddress())
  await beacon.waitForDeployment()
  console.log(`Beacon deployed to: ${await beacon.getAddress()}`)

  // Get the deployer address
  const [deployer] = await ethers.getSigners()
  const initialOwner = process.env.INITIAL_OWNER || deployer.address
  
  // Deploy Beacon Proxy
  const BeaconProxy = await ethers.getContractFactory('BeaconProxy')
  const proxy = await BeaconProxy.deploy(
    await beacon.getAddress(),
    ToiiNetwork.interface.encodeFunctionData('initialize', [initialOwner])
  )
  await proxy.waitForDeployment()
  console.log(`Beacon Proxy deployed to: ${await proxy.getAddress()}`)
  console.log(`Initial owner: ${initialOwner}`)

  // Save addresses to config
  setConfig(`${network}.ToiiNetworkBeacon`, await beacon.getAddress())
  setConfig(`${network}.ToiiNetworkProxy`, await proxy.getAddress())
  setConfig(`${network}.ToiiNetworkImplementation`, await implementation.getAddress())
  setConfig(`${network}.ToiiNetworkBeaconOwner`, await beacon.owner())
  await updateConfig()

  // Verify the proxy works
  const token = ToiiNetwork.attach(await proxy.getAddress())
  console.log(`Token name: ${await token.name()}`)
  console.log(`Token symbol: ${await token.symbol()}`)
  console.log(`Total supply: ${await token.totalSupply()}`)
  console.log(`Transfer fee: ${await token.transferFee()}`)
  console.log(`Current implementation: ${await beacon.implementation()}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}) 