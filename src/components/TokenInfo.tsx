import React, { useState, useEffect } from 'react';
import { Coins, Clock, Gift, Plus, ExternalLink, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { contractService, TokenStats, ContractInfo } from '../utils/contract';

interface TokenInfoProps {
  walletAddress: string;
  gamePoints: number;
  onClaimSuccess: (amount: string) => void;
  onPointsConverted: (points: number, tokens: string) => void;
}

export const TokenInfo: React.FC<TokenInfoProps> = ({ 
  walletAddress, 
  gamePoints, 
  onClaimSuccess, 
  onPointsConverted 
}) => {
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertAmount, setConvertAmount] = useState('100');
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    loadTokenData();
    const interval = setInterval(loadTokenData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [walletAddress]);

  useEffect(() => {
    if (tokenStats && tokenStats.timeUntilNextClaim > 0) {
      setTimeLeft(tokenStats.timeUntilNextClaim);
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            loadTokenData(); // Refresh when cooldown ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdown);
    }
  }, [tokenStats?.timeUntilNextClaim]);

  const loadTokenData = async () => {
    try {
      setError(null);
      const [stats, info] = await Promise.all([
        contractService.getTokenStats(walletAddress),
        contractService.getContractInfo()
      ]);
      setTokenStats(stats);
      setContractInfo(info);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading token data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!walletAddress) return;
    
    setIsClaiming(true);
    setError(null);
    
    try {
      const tx = await contractService.claimTokens();
      
      // Wait for transaction confirmation
      await tx.wait();
      
      onClaimSuccess('1000'); // Claim amount from contract
      await loadTokenData(); // Refresh stats after successful claim
      
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
      console.error('Claim error:', err);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleConvertPoints = async () => {
    const pointsToConvert = parseInt(convertAmount);
    if (!pointsToConvert || pointsToConvert <= 0) return;
    
    setIsConverting(true);
    setError(null);
    
    try {
      const tx = await contractService.convertPointsToTokens(pointsToConvert);
      
      // Wait for transaction confirmation
      await tx.wait();
      
      onPointsConverted(pointsToConvert, pointsToConvert.toString());
      await loadTokenData(); // Refresh stats after successful conversion
      setConvertAmount('100'); // Reset input
      
    } catch (err: any) {
      setError(err.message || 'Failed to convert points');
      console.error('Conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleAddToWallet = async () => {
    const success = await contractService.addTokenToWallet();
    if (success) {
      alert('SPIN token added to your wallet!');
    } else {
      alert('Failed to add token to wallet. Please add it manually.');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black bg-opacity-30 rounded-lg p-6 max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-2 text-white">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading token info...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-sm">{error}</div>
          <div className="text-xs text-gray-400">
            Make sure you're connected to Sepolia testnet and the contract is deployed.
          </div>
          <button
            onClick={loadTokenData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const canClaim = tokenStats && parseFloat(tokenStats.claimableAmount) > 0 && timeLeft === 0;
  const hasGamePoints = parseInt(tokenStats?.gamePoints || '0') > 0;

  return (
    <div className="bg-black bg-opacity-30 rounded-lg p-6 max-w-md mx-auto space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center space-x-2">
          <Coins className="w-6 h-6 text-yellow-400" />
          <span>{contractInfo?.name || 'SPIN Token'}</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-gray-400">Balance</div>
            <div className="text-white font-bold">
              {parseFloat(tokenStats?.balance || '0').toFixed(2)} SPIN
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-gray-400">Game Points</div>
            <div className="text-yellow-400 font-bold">
              {parseInt(tokenStats?.gamePoints || '0')} pts
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-3 text-xs text-blue-400 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>Claim Fee: {contractInfo?.claimFee || '0.001'} ETH</div>
            <div>Max Claim: {contractInfo?.maxClaimAmount || '1000'} SPIN</div>
            <div>Cooldown: 24 hours</div>
            <div>Available: {parseFloat(contractInfo?.contractBalance || '0').toFixed(0)} SPIN</div>
          </div>
        </div>
      </div>

      {/* Claim Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-white">
          <Gift className="w-5 h-5 text-green-400" />
          <span className="font-semibold">Claim Tokens (Pay Fee)</span>
        </div>
        
        {timeLeft > 0 ? (
          <div className="bg-orange-500 bg-opacity-20 border border-orange-500 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-orange-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Next claim available in: {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-3">
              <div className="text-green-400 text-sm text-center flex items-center justify-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Pay 0.001 ETH fee to claim {contractInfo?.maxClaimAmount || '1000'} SPIN tokens</span>
              </div>
            </div>
            
            <button
              onClick={handleClaim}
              disabled={isClaiming || !canClaim}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2"
            >
              {isClaiming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Claim Tokens (0.001 ETH)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Points Conversion Section */}
      {hasGamePoints && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-white">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="font-semibold">Convert Game Points</span>
          </div>
          
          <div className="text-sm text-gray-400 text-center">
            Convert your game points to SPIN tokens (1 point = 1 token)
          </div>
          
          <div className="flex space-x-2">
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              max={parseInt(tokenStats?.gamePoints || '0')}
              min="1"
              disabled={isClaiming}
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
              placeholder="Points to convert"
            />
            <button
              onClick={handleConvertPoints}
              disabled={isConverting || parseInt(convertAmount) > parseInt(tokenStats?.gamePoints || '0')}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
            >
              {isConverting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Convert</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleAddToWallet}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Wallet</span>
        </button>
        
        <a
          href={`https://sepolia.etherscan.io/address/${contractService.CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Contract</span>
        </a>
      </div>
    </div>
  );
};