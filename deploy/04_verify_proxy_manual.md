# Manual BeaconProxy Verification Guide

## Step 1: Go to Etherscan
- Visit: https://sepolia.etherscan.io/address/0xfa97c61Ad6b1b69edA263cD183533390b1b6B9C8
- Click "Contract" tab
- Click "Verify and Publish"

## Step 2: Choose contract type
- Select "Solidity (Single file)"
- Click "Continue"

## Step 3: Upload source code
Copy and paste BeaconProxy source code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract BeaconProxy is BeaconProxy {
    constructor(address beacon, bytes memory data) BeaconProxy(beacon, data) {}
}
```

## Step 4: Constructor Arguments
- **Beacon Address**: `0x8506d1F4164bE8963F2BF13bE50AF1692C05F768`
- **Data**: `0x8129fc1c000000000000000000000000f396972bdB6d5a485fe56A7e8F0053c802F63fCC`

## Step 5: Compiler Settings
- **Compiler Version**: `0.8.27`
- **Optimization**: `Enabled`
- **Runs**: `200`
- **EVM Version**: `paris`

## Step 6: Submit
Click "Verify and Publish"

## Notes:
- BeaconProxy is a proxy contract from OpenZeppelin
- It delegates calls to the implementation contract
- Users interact with the proxy address, not the implementation 