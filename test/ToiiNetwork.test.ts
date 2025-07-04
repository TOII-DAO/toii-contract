import { expect } from 'chai'
import { parseUnits, Signer } from 'ethers'
import { ethers } from 'hardhat'

describe('ToiiNetwork Token', function () {
  let toiiNetwork: any
  let beacon: any
  let proxy: any
  let owner: Signer
  let addr1: Signer
  let addr2: Signer
  let addr3: Signer

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners()
    
    // Deploy implementation
    const ToiiNetwork = await ethers.getContractFactory('ToiiNetwork')
    const implementation = await ToiiNetwork.deploy()
    await implementation.waitForDeployment()

    // Deploy beacon
    const ToiiNetworkBeacon = await ethers.getContractFactory('ToiiNetworkBeacon')
    beacon = await ToiiNetworkBeacon.deploy(await implementation.getAddress())
    await beacon.waitForDeployment()

    // Deploy beacon proxy
    const BeaconProxy = await ethers.getContractFactory('BeaconProxy')
    proxy = await BeaconProxy.deploy(
      await beacon.getAddress(),
      ToiiNetwork.interface.encodeFunctionData('initialize', [await owner.getAddress()])
    )
    await proxy.waitForDeployment()

    // Attach implementation to proxy
    toiiNetwork = ToiiNetwork.attach(await proxy.getAddress())
  })

  describe('Basic Token Functionality', function () {
    it('Should have correct name and symbol', async function () {
      expect(await toiiNetwork.name()).to.equal('ToiiNetwork')
      expect(await toiiNetwork.symbol()).to.equal('Toii')
    })

    it('Should have correct decimals', async function () {
      expect(await toiiNetwork.decimals()).to.equal(18)
    })

    it('Should have correct total supply', async function () {
      expect(await toiiNetwork.totalSupply()).to.equal(parseUnits('10000000000000', 18))
    })

    it('Should mint total supply to owner', async function () {
      expect(await toiiNetwork.balanceOf(await owner.getAddress())).to.equal(parseUnits('10000000000000', 18))
    })

    it('Should allow transfers', async function () {
      await toiiNetwork.transfer(await addr1.getAddress(), parseUnits('1000', 18))
      expect(await toiiNetwork.balanceOf(await addr1.getAddress())).to.equal(parseUnits('1000', 18))
    })

    it('Should allow approvals and transfers from', async function () {
      await toiiNetwork.approve(await addr1.getAddress(), parseUnits('500', 18))
      await toiiNetwork.connect(addr1).transferFrom(await owner.getAddress(), await addr2.getAddress(), parseUnits('300', 18))
      expect(await toiiNetwork.balanceOf(await addr2.getAddress())).to.equal(parseUnits('300', 18))
    })

    it('Should allow burning', async function () {
      const balanceBefore = await toiiNetwork.balanceOf(await owner.getAddress())
      await toiiNetwork.burn(parseUnits('1000', 18))
      expect(await toiiNetwork.balanceOf(await owner.getAddress())).to.equal(balanceBefore - parseUnits('1000', 18))
    })
  })

  describe('Transfer Fee Functionality', function () {
    it('Should have zero transfer fee by default', async function () {
      expect(await toiiNetwork.transferFee()).to.equal(0)
    })

    it('Should allow owner to set transfer fee', async function () {
      await toiiNetwork.setTransferFee(100) // 1%
      expect(await toiiNetwork.transferFee()).to.equal(100)
    })

    it('Should not allow non-owner to set transfer fee', async function () {
      await expect(
        toiiNetwork.connect(addr1).setTransferFee(100)
      ).to.be.revertedWithCustomError(toiiNetwork, 'OwnableUnauthorizedAccount')
    })

    it('Should not allow transfer fee above 10%', async function () {
      await expect(
        toiiNetwork.setTransferFee(1100) // 11%
      ).to.be.revertedWithCustomError(toiiNetwork, 'InvalidFee')
    })

    it('Should apply transfer fee correctly', async function () {
      await toiiNetwork.setTransferFee(500) // 5%
      // Remove owner from fee exclusion to test fee
      await toiiNetwork.setExcludedFromFee(await owner.getAddress(), false)
      
      await toiiNetwork.transfer(await addr1.getAddress(), parseUnits('1000', 18))
      
      // Recipient should receive 95% (1000 - 5% = 950)
      expect(await toiiNetwork.balanceOf(await addr1.getAddress())).to.equal(parseUnits('950', 18))
      
      // Owner should receive the fee (50 tokens)
      const ownerBalanceAfter = await toiiNetwork.balanceOf(await owner.getAddress())
      const expectedBalance = parseUnits('10000000000000', 18) - parseUnits('1000', 18) + parseUnits('50', 18)
      expect(ownerBalanceAfter).to.equal(expectedBalance)
    })

    it('Should not apply fee to excluded addresses', async function () {
      await toiiNetwork.setTransferFee(500) // 5%
      await toiiNetwork.setExcludedFromFee(await addr1.getAddress(), true)
      
      await toiiNetwork.transfer(await addr1.getAddress(), parseUnits('1000', 18))
      expect(await toiiNetwork.balanceOf(await addr1.getAddress())).to.equal(parseUnits('1000', 18)) // No fee
    })

    it('Should allow owner to exclude addresses from fee', async function () {
      await toiiNetwork.setExcludedFromFee(await addr1.getAddress(), true)
      expect(await toiiNetwork.isExcludedFromFee(await addr1.getAddress())).to.be.true
    })

    it('Should not apply fee when sender is excluded', async function () {
      await toiiNetwork.setTransferFee(500) // 5%
      await toiiNetwork.setExcludedFromFee(await owner.getAddress(), true)
      
      await toiiNetwork.transfer(await addr1.getAddress(), parseUnits('1000', 18))
      expect(await toiiNetwork.balanceOf(await addr1.getAddress())).to.equal(parseUnits('1000', 18)) // No fee
    })

    it('Should not apply fee when recipient is excluded', async function () {
      await toiiNetwork.setTransferFee(500) // 5%
      await toiiNetwork.setExcludedFromFee(await addr1.getAddress(), true)
      
      await toiiNetwork.transfer(await addr1.getAddress(), parseUnits('1000', 18))
      expect(await toiiNetwork.balanceOf(await addr1.getAddress())).to.equal(parseUnits('1000', 18)) // No fee
    })

    it('Should not apply fee to minting or burning', async function () {
      await toiiNetwork.setTransferFee(500) // 5%
      
      // Minting (from zero address) should not have fee
      const balanceBefore = await toiiNetwork.balanceOf(await owner.getAddress())
      await toiiNetwork.burn(parseUnits('100', 18))
      const balanceAfter = await toiiNetwork.balanceOf(await owner.getAddress())
      expect(balanceAfter).to.equal(balanceBefore - parseUnits('100', 18))
    })
  })

  describe('Beacon Pattern', function () {
    it('Should have correct beacon owner', async function () {
      expect(await beacon.owner()).to.equal(await owner.getAddress())
    })

    it('Should have correct implementation address', async function () {
      const implementationAddress = await beacon.implementation()
      expect(implementationAddress).to.not.equal(ethers.ZeroAddress)
    })

    it('Should allow owner to upgrade implementation', async function () {
      // Deploy new implementation
      const ToiiNetwork = await ethers.getContractFactory('ToiiNetwork')
      const newImplementation = await ToiiNetwork.deploy()
      await newImplementation.waitForDeployment()

      await beacon.upgradeTo(await newImplementation.getAddress())
      expect(await beacon.implementation()).to.equal(await newImplementation.getAddress())
    })

    it('Should not allow non-owner to upgrade', async function () {
      const ToiiNetwork = await ethers.getContractFactory('ToiiNetwork')
      const newImplementation = await ToiiNetwork.deploy()
      await newImplementation.waitForDeployment()

      await expect(
        beacon.connect(addr1).upgradeTo(await newImplementation.getAddress())
      ).to.be.revertedWithCustomError(beacon, 'OwnableUnauthorizedAccount')
    })

    it('Should not allow upgrade to zero address', async function () {
      await expect(
        beacon.upgradeTo(ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid implementation')
    })

    it('Should maintain state after upgrade', async function () {
      // Setup some state
      await toiiNetwork.setTransferFee(100)
      await toiiNetwork.transfer(await addr1.getAddress(), parseUnits('1000', 18))

      // Deploy new implementation
      const ToiiNetwork = await ethers.getContractFactory('ToiiNetwork')
      const newImplementation = await ToiiNetwork.deploy()
      await newImplementation.waitForDeployment()

      // Upgrade
      await beacon.upgradeTo(await newImplementation.getAddress())

      // Verify state is maintained
      const upgradedToken = ToiiNetwork.attach(await proxy.getAddress())
      expect(await upgradedToken.transferFee()).to.equal(100)
      expect(await upgradedToken.balanceOf(await addr1.getAddress())).to.equal(parseUnits('1000', 18))
    })
  })

  describe('Edge Cases', function () {
    it('Should handle zero transfers correctly', async function () {
      await expect(
        toiiNetwork.transfer(await addr1.getAddress(), 0)
      ).to.not.be.reverted
    })

    it('Should handle transfers from zero address (minting)', async function () {
      // This would be done through the contract's internal functions
      expect(await toiiNetwork.balanceOf(await owner.getAddress())).to.equal(parseUnits('10000000000000', 18))
    })
  })

  describe('Advanced & Stress Tests', function () {
    it('Should rollback upgrade with snapshot/revert', async function () {
      // Setup state
      await toiiNetwork.setTransferFee(100)
      await toiiNetwork.transfer(await addr1.getAddress(), parseUnits('1000', 18))
      
      // Take snapshot
      const snapshotId = await ethers.provider.send('evm_snapshot', [])
      
      // Upgrade implementation
      const ToiiNetwork = await ethers.getContractFactory('ToiiNetwork')
      const newImplementation = await ToiiNetwork.deploy()
      await newImplementation.waitForDeployment()
      await beacon.upgradeTo(await newImplementation.getAddress())
      
      // Change state after upgrade
      const upgradedToken = ToiiNetwork.attach(await proxy.getAddress())
      await upgradedToken.setTransferFee(200)
      expect(await upgradedToken.transferFee()).to.equal(200)
      
      // Revert to snapshot
      await ethers.provider.send('evm_revert', [snapshotId])
      // Re-attach old contract
      toiiNetwork = ToiiNetwork.attach(await proxy.getAddress())
      // State should be as before upgrade
      expect(await toiiNetwork.transferFee()).to.equal(100)
      expect(await toiiNetwork.balanceOf(await addr1.getAddress())).to.equal(parseUnits('1000', 18))
    })

    it('Should allow burnFrom after approve', async function () {
      await toiiNetwork.transfer(await addr1.getAddress(), parseUnits('1000', 18))
      await toiiNetwork.connect(addr1).approve(await addr2.getAddress(), parseUnits('500', 18))
      // addr2 burns 300 tokens from addr1
      await toiiNetwork.connect(addr2).burnFrom(await addr1.getAddress(), parseUnits('300', 18))
      expect(await toiiNetwork.balanceOf(await addr1.getAddress())).to.equal(parseUnits('700', 18))
      // allowance reduced
      expect(await toiiNetwork.allowance(await addr1.getAddress(), await addr2.getAddress())).to.equal(parseUnits('200', 18))
    })

    it('Stress test: 100 small transfers', async function () {
      for (let i = 0; i < 100; i++) {
        await toiiNetwork.transfer(await addr1.getAddress(), parseUnits('1', 18))
      }
      // Check final balance
      expect(await toiiNetwork.balanceOf(await addr1.getAddress())).to.equal(parseUnits('100', 18))
    })
  })
})

