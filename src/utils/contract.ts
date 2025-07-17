import { ethers } from 'ethers';

// Update this with your deployed contract address
export const SPIN_TOKEN_ADDRESS = '0xffDDC37C8d6f91c5Eb40399575F599bf3c5a5BEc'; // Your existing token contract

export const SPIN_TOKEN_ABI = [
  // ERC20 Standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  
  // Custom SpinToken functions
  "function claimTokens() external payable",
  "function addGamePoints(address user, uint256 points) external",
  "function convertPointsToTokens(uint256 points) external",
  "function distributeReward(address user, uint256 amount, uint256 multiplier) external",
  "function getClaimableAmount(address user) view returns (uint256)",
  "function getTimeUntilNextClaim(address user) view returns (uint256)",
  "function getUserStats(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
  "function getContractBalance() view returns (uint256)",
  "function withdrawFees() external",
  
  // Constants
  "function MAX_SUPPLY() view returns (uint256)",
  "function CLAIM_COOLDOWN() view returns (uint256)",
  "function MAX_CLAIM_AMOUNT() view returns (uint256)",
  "function CLAIM_FEE() view returns (uint256)",
  
  // Mappings
  "function lastClaimTime(address) view returns (uint256)",
  "function totalClaimed(address) view returns (uint256)",
  "function gamePoints(address) view returns (uint256)",
  
  // Events
  "event TokensClaimed(address indexed user, uint256 amount, uint256 fee)",
  "event GameReward(address indexed user, uint256 amount, uint256 multiplier)",
  "event PointsConverted(address indexed user, uint256 points, uint256 tokens)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export interface TokenStats {
  balance: string;
  totalClaimed: string;
  lastClaimTime: number;
  timeUntilNextClaim: number;
  claimableAmount: string;
  gamePoints: string;
}

export interface ContractInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  maxClaimAmount: string;
  claimCooldown: number;
  claimFee: string;
  contractBalance: string;
}

export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  public signer: ethers.JsonRpcSigner | null = null;

  async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    
    // Create contract with basic ERC20 ABI for your existing token
    const basicTokenABI = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function mint(address to, uint256 amount) returns (bool)',
      'function claim() returns (bool)',
      'function faucet() returns (bool)',
      'function getTokens() returns (bool)',
      'function airdrop(address to, uint256 amount) returns (bool)',
      'event Transfer(address indexed from, address indexed to, uint256 value)'
    ];
    
    this.contract = new ethers.Contract(SPIN_TOKEN_ADDRESS, basicTokenABI, signer);
  }

  async getTokenBalance(address: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const balance = await this.contract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  async getTokenStats(address: string): Promise<TokenStats> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      // Get basic token balance
      const balance = await this.contract.balanceOf(address);
      
      return {
        balance: ethers.formatEther(balance),
        totalClaimed: '0',
        lastClaimTime: 0,
        timeUntilNextClaim: 0,
        claimableAmount: '100', // Default claimable amount
        gamePoints: '0'
      };
    } catch (error) {
      console.error('Error getting token stats:', error);
      throw error;
    }
  }

  async getContractInfo(): Promise<ContractInfo> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply()
      ]);
      
      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply),
        maxClaimAmount: '100',
        claimCooldown: 0,
        claimFee: '0',
        contractBalance: '1000000'
      };
    } catch (error) {
      console.error('Error getting contract info:', error);
      throw error;
    }
  }

  async claimTokens(): Promise<ethers.TransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.claimTokens({
        value: ethers.parseEther('0.001'), // Send 0.001 ETH as fee
        gasLimit: 200000
      });
      
      return tx;
    } catch (error: any) {
      console.error('Claim transaction failed:', error);
      
      throw new Error(`Claim failed: ${error.message || 'Transaction failed'}`);
    }
  }

  async convertPointsToTokens(points: number): Promise<ethers.TransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.convertPointsToTokens(points, {
        gasLimit: 150000
      });
      
      return tx;
    } catch (error: any) {
      console.error('Points conversion failed:', error);
      
      if (error.message.includes('Insufficient game points')) {
        throw new Error(`You need ${points} game points to convert`);
      } else if (error.message.includes('Insufficient tokens in contract')) {
        throw new Error('Contract is out of tokens for conversion');
      } else {
        throw new Error(`Conversion failed: ${error.message}`);
      }
    }
  }

  async addTokenToWallet(): Promise<boolean> {
    if (!window.ethereum) return false;
    
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: SPIN_TOKEN_ADDRESS,
            symbol: 'SPIN',
            decimals: 18,
            image: 'https://via.placeholder.com/64x64.png?text=SPIN',
          },
        },
      });
      
      return wasAdded;
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      return false;
    }
  }

  onTokensClaimed(callback: (user: string, amount: string, fee: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('TokensClaimed', (user, amount, fee) => {
      callback(user, ethers.formatEther(amount), ethers.formatEther(fee));
    });
  }

  onPointsConverted(callback: (user: string, points: string, tokens: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('PointsConverted', (user, points, tokens) => {
      callback(user, points.toString(), ethers.formatEther(tokens));
    });
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export const contractService = new ContractService();