# 🎰 Crypto Spin-to-Win with Real Token Airdrop

A complete Web3 gaming application with real smart contract integration on Sepolia testnet. Users can spin to win game points, claim real ERC-20 tokens by paying ETH fees, and convert game points to tokens.

## 🚀 Features

### 🎮 Game Features
- **Interactive Spin Wheel**: Beautiful animated wheel with 8 reward tiers
- **Game Points System**: Earn points from spinning that convert to real tokens
- **Real Token Claims**: Pay ETH fees to claim actual SPIN tokens
- **Point Conversion**: Convert game points to tokens for free

### 🔗 Blockchain Integration
- **Real Smart Contract**: Custom ERC-20 token with airdrop functionality
- **Sepolia Testnet**: Fully deployed on Ethereum Sepolia testnet
- **MetaMask Integration**: Connect with Web3 wallets
- **Transaction Fees**: Real ETH fees for token claims (0.001 ETH)

### 💰 Token Economics
- **Symbol**: SPIN
- **Total Supply**: 1,000,000 SPIN
- **Claim Amount**: 1,000 SPIN per claim
- **Claim Fee**: 0.001 ETH per claim
- **Cooldown**: 24 hours between claims
- **Point Conversion**: 1 game point = 1 SPIN token (free)

## 🛠️ Smart Contract Deployment

### Step 1: Get Sepolia ETH
Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get free testnet ETH for deployment.

### Step 2: Deploy Using Remix IDE

1. **Open Remix**: Go to [https://remix.ethereum.org/](https://remix.ethereum.org/)

2. **Create Contract File**:
   - Create new file: `SpinToken.sol`
   - Copy the contract code from `contracts/SpinToken.sol`

3. **Compile Contract**:
   - Select Solidity compiler 0.8.19+
   - Enable optimization
   - Compile the contract

4. **Deploy Contract**:
   - Connect MetaMask to Remix (Injected Provider)
   - Switch to Sepolia testnet
   - Deploy the `SpinToken` contract
   - Copy the deployed contract address

5. **Update Website**:
   - Replace `SPIN_TOKEN_ADDRESS` in `src/utils/contract.ts` with your deployed address

### Step 3: Test the System

```bash
npm install
npm run dev
```

## 🎯 How It Works

### For Users:
1. **Connect Wallet**: Connect MetaMask to Sepolia testnet
2. **Spin to Win**: Spin the wheel to earn game points
3. **Claim Tokens**: Pay 0.001 ETH to claim 1,000 SPIN tokens (24h cooldown)
4. **Convert Points**: Convert game points to tokens for free (no cooldown)
5. **Add to Wallet**: Add SPIN token to MetaMask to see balance

### For Contract Owner:
- **Withdraw Fees**: Collect ETH fees from token claims
- **Distribute Rewards**: Send bonus tokens to users
- **Emergency Functions**: Withdraw remaining tokens if needed

## 📋 Contract Functions

### User Functions
```solidity
claimTokens() payable          // Claim tokens by paying ETH fee
convertPointsToTokens(uint256) // Convert game points to tokens
balanceOf(address)             // Check token balance
getUserStats(address)          // Get comprehensive user data
```

### Owner Functions
```solidity
addGamePoints(address, uint256)     // Add game points to user
distributeReward(address, uint256)  // Send bonus tokens
withdrawFees()                      // Withdraw collected ETH fees
emergencyWithdraw()                 // Emergency token withdrawal
```

## 🔧 Configuration

### Environment Setup
```bash
# Get Sepolia ETH
https://sepoliafaucet.com/

# Your Sepolia wallet (example mnemonic provided)
# burden huge base feel hard buffalo gravity insect envelope weasel clerk trim
```

### Contract Configuration
```solidity
MAX_SUPPLY = 1,000,000 SPIN        // Total token supply
CLAIM_COOLDOWN = 24 hours          // Time between claims
MAX_CLAIM_AMOUNT = 1,000 SPIN      // Tokens per claim
CLAIM_FEE = 0.001 ETH              // Fee per claim
```

## 🎨 Game Mechanics

### Spin Rewards (Game Points)
- **1x**: 10 points (Blue)
- **2x**: 25 points (Green)  
- **5x**: 50 points (Yellow)
- **10x**: 100 points (Purple)
- **25x**: 250 points (Pink)
- **50x**: 500 points (Red)
- **100x**: 1,000 points (Orange)
- **250x**: 2,500 points (Indigo)

### Token Claiming Options
1. **Pay ETH Fee**: 0.001 ETH → 1,000 SPIN tokens (24h cooldown)
2. **Convert Points**: Game points → SPIN tokens (1:1 ratio, no cooldown)

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Owner-only functions protected
- **Supply Limits**: Maximum supply and claim limits enforced
- **Cooldown System**: Prevents spam claiming
- **Fee Validation**: Ensures proper ETH fees are paid
- **Excess Refund**: Automatically refunds excess ETH

## 🌐 Network Information

- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **RPC**: https://sepolia.infura.io/v3/
- **Explorer**: https://sepolia.etherscan.io/

## 📱 User Interface

### Wallet Connection
- Real Web3 wallet integration
- Network switching to Sepolia
- Balance and address display
- Connection status indicators

### Game Interface  
- Animated spinning wheel
- Real-time point tracking
- Win celebrations and animations
- Smooth state transitions

### Token Management
- Real token balance display
- Claim functionality with fee payment
- Point conversion interface
- Add token to wallet feature
- Transaction status and confirmations

## 🚨 Important Notes

### For Users
- **Testnet Only**: This is for Sepolia testnet, not mainnet
- **Real Transactions**: All claims require real ETH fees
- **24h Cooldown**: Wait between paid claims
- **Free Conversion**: Game points convert to tokens for free

### For Developers
- **Contract Deployment**: Must deploy contract before use
- **Address Update**: Update contract address in code
- **Fee Collection**: Owner can withdraw collected ETH fees
- **Token Distribution**: Contract holds tokens for distribution

## 🎉 Getting Started

1. **Get Sepolia ETH**: Use faucet to get testnet ETH
2. **Deploy Contract**: Use Remix IDE to deploy SpinToken
3. **Update Address**: Replace contract address in code
4. **Start Playing**: Connect wallet and start spinning!

## 📞 Support

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Remix IDE**: https://remix.ethereum.org/
- **MetaMask**: https://metamask.io/
- **Etherscan**: https://sepolia.etherscan.io/

---

**Ready to spin and win real tokens? Deploy your contract and start the game!** 🎰✨