import { ethers } from 'ethers';
import { contractService } from './contract';

export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  provider: ethers.BrowserProvider;
}

export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(): Promise<WalletInfo> {
    if (!window.ethereum) {
      throw new Error('MetaMask or another Web3 wallet is required');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Get wallet info
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      const network = await this.provider.getNetwork();
      
      // Initialize contract service
      try {
        await contractService.initialize(this.provider, this.signer);
      } catch (error) {
        console.warn('Contract initialization failed:', error);
      }
      
      return {
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
        provider: this.provider
      };
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async switchToEthereum(): Promise<void> {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia testnet
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
          }]
        });
      }
    }
  }

  async switchToSepolia(): Promise<void> {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia testnet
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
          }]
        });
      }
    }
  }

  async switchToMonad(): Promise<void> {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x27a7' }], // Monad testnet chain ID (10143)
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x27a7',
            chainName: 'Monad Testnet',
            nativeCurrency: {
              name: 'Monad',
              symbol: 'MON',
              decimals: 18
            },
            rpcUrls: ['https://testnet-rpc.monad.xyz/'],
            blockExplorerUrls: ['https://testnet.monadexplorer.com/']
          }]
        });
      }
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Wallet not connected');
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    contractService.removeAllListeners();
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  removeAllListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }
}

export const walletService = new WalletService();