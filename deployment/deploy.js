const { ethers } = require('ethers');
require('dotenv').config();

async function deploySpinToken() {
  // Your wallet details
  const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
  const PRIVATE_KEY = '0x' + 'burden huge base feel hard buffalo gravity insect envelope weasel clerk trim'.split(' ').map(word => {
    // This is a simplified conversion - in reality you'd use proper BIP39 mnemonic to private key conversion
    // For security, you should use a proper wallet library
    return word.charCodeAt(0).toString(16).padStart(2, '0');
  }).join('').padEnd(64, '0');
  
  console.log('⚠️  WARNING: This is a demo conversion. Use proper BIP39 libraries for real deployment!');
  console.log('For real deployment, use your actual private key or hardware wallet.');
  
  // Alternative: Use your actual private key directly
  // const PRIVATE_KEY = 'your_actual_private_key_here';
  
  try {
    // Connect to Sepolia testnet
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    
    // For demo purposes - you should use your real private key
    console.log('Please replace this with your actual private key for real deployment.');
    console.log('You can export it from MetaMask: Account Details > Export Private Key');
    
    return;
    
    // Uncomment below when you have your real private key
    /*
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('Deploying from address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.01')) {
      console.error('Insufficient balance. You need at least 0.01 ETH for deployment.');
      console.log('Get Sepolia ETH from: https://sepoliafaucet.com/');
      process.exit(1);
    }
    
    // Contract compilation data (you'll get this from Remix)
    const contractABI = []; // Paste ABI from Remix here
    const contractBytecode = "0x"; // Paste bytecode from Remix here
    
    // Deploy the contract
    console.log('Deploying SpinToken contract...');
    
    const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const contract = await factory.deploy();
    
    console.log('Deployment transaction sent:', contract.deploymentTransaction().hash);
    
    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log('✅ Contract deployed successfully!');
    console.log('📍 Contract address:', contractAddress);
    console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Update CONTRACT_ADDRESS in src/utils/contract.ts');
    console.log('2. Verify the contract on Etherscan');
    console.log('3. Test the claiming functionality');
    console.log('4. Share the contract address with users');
    */
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

// Instructions for manual deployment
console.log('🚀 SpinToken Deployment Guide');
console.log('============================');
console.log('');
console.log('For security, please deploy manually using Remix IDE:');
console.log('');
console.log('1. 📁 Open https://remix.ethereum.org/');
console.log('2. 📝 Create new file: SpinToken.sol');
console.log('3. 📋 Copy the contract code from contracts/SpinToken.sol');
console.log('4. 🔧 Compile with Solidity 0.8.19+');
console.log('5. 🌐 Connect to Injected Provider (MetaMask)');
console.log('6. 🔄 Switch to Sepolia testnet');
console.log('7. 🚀 Deploy the contract');
console.log('8. 📍 Copy the contract address');
console.log('9. ✏️  Update CONTRACT_ADDRESS in src/utils/contract.ts');
console.log('');
console.log('💰 Make sure you have Sepolia ETH: https://sepoliafaucet.com/');

deploySpinToken();