// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ToiiNetwork is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable {
    uint8 public constant DECIMALS = 18;
    uint256 public constant MAX_SUPPLY = 10_000_000_000_000 * 10 ** DECIMALS;

    uint256 public transferFee;
    mapping(address => bool) public isExcludedFromFee;

    error InvalidFee();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC20_init("ToiiNetwork", "Toii");
        __ERC20Burnable_init();
        __Ownable_init(initialOwner);
        
        _mint(initialOwner, MAX_SUPPLY);
        isExcludedFromFee[initialOwner] = true;
    }

    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
    }

    function _update(address from, address to, uint256 value) internal virtual override {
        if (from != address(0) && to != address(0) && transferFee > 0) {
            if (!isExcludedFromFee[from] && !isExcludedFromFee[to]) {
                uint256 feeAmount = (value * transferFee) / 10000;
                if (feeAmount > 0) {
                    super._update(from, owner(), feeAmount);
                    super._update(from, to, value - feeAmount);
                    return;
                }
            }
        }
        super._update(from, to, value);
    }

    // Admin
    function setTransferFee(uint256 _fee) external onlyOwner {
        if (_fee > 1000) revert InvalidFee();
        transferFee = _fee;
    }

    function setExcludedFromFee(address account, bool excluded) external onlyOwner {
        isExcludedFromFee[account] = excluded;
    }
}