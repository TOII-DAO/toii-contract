# ToiiNetwork Token

ERC20 token with transfer fee functionality and upgradeable pattern.

## 📋 Token Information

- **Name:** ToiiNetwork
- **Symbol:** Toii
- **Decimals:** 18
- **Total Supply:** 10,000,000,000,000 tokens (10 trillion)
- **Networks:** Ethereum, Arbitrum, Sepolia

## 🚀 Deployment

### 1. Install dependencies
```bash
npm install
```

### 2. Environment setup
Create `.env` file:
```env
PR_KEY=your_private_key_here
ARBITRUM_API_KEY=your_arbitrum_api_key
```

### 3. Compile contracts
```bash
npx hardhat compile
```

### 4. Deploy to testnet (Sepolia)
```bash
npx hardhat run deploy/01_toiiNetwork.ts --network sepolia
```

### 5. Deploy to mainnet (Arbitrum)
```bash
npx hardhat run deploy/01_toiiNetwork.ts --network arbitrum
```

### 6. Verify contracts
```bash
npx hardhat verify --network sepolia <contract-address>
npx hardhat verify --network arbitrum <contract-address>
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests on specific network
npx hardhat test --network sepolia
```

## 📝 Features

### Transfer Fee
- Configurable transfer fee (0-10%)
- Fee is sent to owner
- Ability to exclude addresses from fee

### Admin Functions
```solidity
// Set transfer fee (0-1000 = 0-10%)
setTransferFee(uint256 _fee)

// Exclude address from fee
setExcludedFromFee(address account, bool excluded)
```

### Upgradeable
- Uses Beacon Proxy pattern
- Can upgrade contract logic
- Data preserved after upgrade

## 🔧 Usage

### 1. Check token information
```javascript
// Name and symbol
await token.name() // "ToiiNetwork"
await token.symbol() // "Toii"
await token.decimals() // 18

// Total supply
await token.totalSupply() // 10,000,000,000,000 * 10^18
```

### 2. Transfer tokens
```javascript
// Basic transfer
await token.transfer(recipient, amount)

// Transfer with approve
await token.approve(spender, amount)
await token.transferFrom(from, to, amount)
```

### 3. Burn tokens
```javascript
// Burn own tokens
await token.burn(amount)

// Burn others' tokens (requires approve)
await token.burnFrom(account, amount)
```

### 4. Check fees
```javascript
// Current fee
await token.transferFee() // 0-1000 (0-10%)

// Check if address is excluded from fee
await token.isExcludedFromFee(address)
```

## 📊 Networks

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Sepolia | 11155111 | Ankr | Etherscan |
| Arbitrum | 42161 | Ankr | Arbiscan |

## 🔒 Security

- Uses audited OpenZeppelin contracts
- Upgradeable pattern with Beacon Proxy
- Access control with Ownable
- Transfer fee limited to maximum 10%

## 📄 License

MIT License

## 🤝 Support

If you encounter any issues, please create an issue on GitHub.