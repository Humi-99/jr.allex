import React, { useState } from 'react';
import { Wallet, AlertCircle, CheckCircle, ExternalLink, LogOut, Settings } from 'lucide-react';
import { WalletInfo } from '../utils/wallet';

interface WalletConnectionProps {
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  walletInfo: WalletInfo | null;
  isConnecting: boolean;
  error: string | null;
  onSwitchToMonad?: () => Promise<void>;
  isSwitchingNetwork?: boolean;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnect,
  onDisconnect,
  walletInfo,
  isConnecting,
  error,
  onSwitchToMonad,
  isSwitchingNetwork = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getChainName = (chainId: number): string => {
    switch (chainId) {
      case 11155111: return 'Sepolia Testnet';
      case 666: return 'Monad Testnet';
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Polygon Mumbai';
      default: return `Chain ID: ${chainId}`;
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  if (!walletInfo) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Monad Spin
            </span>
          </h1>
          <p className="text-xl text-gray-300">Connect your Web3 wallet to start spinning for coins!</p>
        </div>
        
        <div className="flex justify-center space-x-4 mb-8">
          <div className="w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto disabled:scale-100"
        >
          <Wallet className={`w-6 h-6 ${isConnecting ? 'animate-pulse' : ''}`} />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>

        <div className="text-sm text-gray-400 max-w-md mx-auto">
          <p className="mb-2">Supported wallets:</p>
          <div className="flex justify-center space-x-4">
            <span className="bg-gray-800 px-3 py-1 rounded">MetaMask</span>
            <span className="bg-gray-800 px-3 py-1 rounded">WalletConnect</span>
            <span className="bg-gray-800 px-3 py-1 rounded">Coinbase Wallet</span>
          </div>
          <p className="mt-2 text-xs text-yellow-400">
            ⚠️ Please connect to Sepolia testnet or Monad testnet for token claiming
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center space-x-2 text-white">
      <div 
        className="bg-black bg-opacity-30 rounded-lg px-4 py-2 cursor-pointer hover:bg-opacity-40 transition-all"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300">Wallet: </span>
          <span className="font-mono">{formatAddress(walletInfo.address)}</span>
        </div>
        
        {showDetails && (
          <div className="mt-2 pt-2 border-t border-gray-600 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className={walletInfo.chainId === 10143 ? 'text-purple-400' : ''}>{getChainName(walletInfo.chainId)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ETH Balance:</span>
              <span>{formatBalance(walletInfo.balance)} ETH</span>
            </div>
            
            {/* Network Switch Buttons */}
            <div className="flex space-x-2 mt-2">
              {walletInfo.chainId !== 10143 && onSwitchToMonad && (
                <button
                  onClick={onSwitchToMonad}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                  disabled={isSwitchingNetwork}
                >
                  <Settings className="w-3 h-3" />
                  <span>{isSwitchingNetwork ? 'Switching...' : 'Switch to Monad'}</span>
                </button>
              )}
            </div>
            
            <a
              href={walletInfo.chainId === 666 
                ? `https://testnet.monadexplorer.com/address/${walletInfo.address}`
                : `https://sepolia.etherscan.io/address/${walletInfo.address}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View on Explorer</span>
            </a>
          </div>
        )}
      </div>
      
      {/* Disconnect Button */}
      <button
        onClick={onDisconnect}
        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors flex items-center"
        title="Disconnect Wallet"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};