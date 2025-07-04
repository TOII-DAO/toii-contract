// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract ToiiNetworkBeacon is IBeacon, Ownable {
    address private _implementationAddress;

    event Upgraded(address indexed implementation);

    constructor(address impl) Ownable(msg.sender) {
        _implementationAddress = impl;
    }

    function implementation() external view override returns (address) {
        return _implementationAddress;
    }

    function upgradeTo(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation");
        _implementationAddress = newImplementation;
        emit Upgraded(newImplementation);
    }
} 