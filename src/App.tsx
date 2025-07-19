import React, { useState, useEffect } from 'react';
import { Coins, RotateCcw, Sparkles, AlertCircle, Network } from 'lucide-react';
import { walletService, WalletInfo } from './utils/wallet';
import { WalletConnection } from './components/WalletConnection';
import { TokenInfo } from './components/TokenInfo';

type GameState = 'disconnected' | 'connected' | 'spinning' | 'won' | 'claimed';

interface SpinResult {
  coins: number;
  multiplier: string;
  color: string;
}

const SPIN_REWARDS = [
  { coins: 10, multiplier: '1x', color: 'bg-blue-500' },
  { coins: 25, multiplier: '2x', color: 'bg-green-500' },
  { coins: 50, multiplier: '5x', color: 'bg-yellow-500' },
  { coins: 100, multiplier: '10x', color: 'bg-purple-500' },
  { coins: 250, multiplier: '25x', color: 'bg-pink-500' },
  { coins: 500, multiplier: '50x', color: 'bg-red-500' },
  { coins: 1000, multiplier: '100x', color: 'bg-orange-500' },
  { coins: 2500, multiplier: '250x', color: 'bg-indigo-500' },
];

function App() {
  const [gameState, setGameState] = useState<GameState>('disconnected');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState(0);
  const [lastWin, setLastWin] = useState<SpinResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [gamePoints, setGamePoints] = useState(0);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  useEffect(() => {
    // Set up wallet event listeners
    walletService.onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        // Account changed, reconnect
        connectWallet();
      }
    });

    walletService.onChainChanged(() => {
      // Chain changed, reconnect
      connectWallet();
    });

    return () => {
      walletService.removeAllListeners();
    };
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const info = await walletService.connectWallet();
      setWalletInfo(info);
      
      // Check if connected to Sepolia
      if (info.chainId !== 11155111) {
        try {
          await walletService.switchToSepolia();
          // Reconnect after network switch
          const updatedInfo = await walletService.connectWallet();
          setWalletInfo(updatedInfo);
        } catch (switchError) {
          console.warn('Failed to switch to Sepolia:', switchError);
        }
      }
      
      setGameState('connected');
      setBalance(0); // Reset game balance (separate from ETH balance)
    } catch (err: any) {
      setError(err.message);
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    walletService.disconnect();
    setWalletInfo(null);
    setGameState('disconnected');
    setBalance(0);
    setGamePoints(0);
    setError(null);
    setShowTokenInfo(false);
  };

  const handleSwitchToMonad = async () => {
    if (isSwitchingNetwork) return;
    
    setIsSwitchingNetwork(true);
    try {
      await walletService.switchToMonad();
      // Reconnect after network switch
      const updatedInfo = await walletService.connectWallet();
      setWalletInfo(updatedInfo);
    } catch (error) {
      console.error('Failed to switch to Monad:', error);
      setError('Failed to switch to Monad network');
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const handleClaimSuccess = (amount: string) => {
    setClaimSuccess(`Successfully claimed ${amount} SPIN tokens!`);
    setTimeout(() => setClaimSuccess(null), 5000);
  };

  const handlePointsConverted = (points: number, tokens: string) => {
    setGamePoints(prev => prev - points);
    setClaimSuccess(`Successfully converted ${points} points to ${tokens} SPIN tokens!`);
    setTimeout(() => setClaimSuccess(null), 5000);
  };

  const handleSwitchToSepolia = async () => {
    if (isSwitchingNetwork) return;
    
    setIsSwitchingNetwork(true);
    try {
      await walletService.switchToSepolia();
      // Reconnect after network switch
      const updatedInfo = await walletService.connectWallet();
      setWalletInfo(updatedInfo);
    } catch (error) {
      console.error('Failed to switch to Sepolia:', error);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const spinWheel = async () => {
    if (isSpinning || !walletInfo) return;
    
    setIsSpinning(true);
    setGameState('spinning');
    
    // Generate random result
    const result = SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)];
    
    // Calculate rotation (multiple full rotations + final position)
    const finalRotation = rotation + 1440 + Math.random() * 360;
    setRotation(finalRotation);
    
    // Wait for animation to complete
    setTimeout(() => {
      setLastWin(result);
      setGamePoints(prev => prev + result.coins); // Add game points
      setIsSpinning(false);
      setGameState('won');
    }, 3000);
  };

  const claimCoins = () => {
    if (lastWin) {
      setBalance(balance + lastWin.coins);
      setGameState('claimed');
      setTimeout(() => setGameState('connected'), 2000);
    }
  };

  const SpinWheel = () => (
    <div className="relative w-80 h-80 mx-auto">
      <div 
        className="w-full h-full rounded-full border-8 border-gray-300 relative overflow-hidden transition-transform duration-3000 ease-out shadow-2xl"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {SPIN_REWARDS.map((reward, index) => (
          <div
            key={index}
            className={`absolute w-full h-full ${reward.color} opacity-80`}
            style={{
              transform: `rotate(${index * 45}deg)`,
              clipPath: 'polygon(50% 50%, 50% 0%, 85.36% 14.64%)'
            }}
          >
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
              {reward.multiplier}
            </div>
          </div>
        ))}
      </div>
      
      {/* Center pointer */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-gray-800 z-10 shadow-lg"></div>
      
      {/* Top pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gray-800 z-10"></div>
    </div>
  );

  if (gameState === 'disconnected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <WalletConnection
          onConnect={connectWallet}
          onDisconnect={handleDisconnect}
          walletInfo={walletInfo}
          isConnecting={isConnecting}
          error={error}
          onSwitchToMonad={handleSwitchToMonad}
          isSwitchingNetwork={isSwitchingNetwork}
        />
      </div>
    );
  }

  if (gameState === 'connected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Monad Spin
              </span>
            </h1>
            <div className="flex justify-center items-center space-x-4 mb-4">
              <WalletConnection
                onConnect={connectWallet}
                onDisconnect={handleDisconnect}
                walletInfo={walletInfo}
                isConnecting={isConnecting}
                error={error}
                onSwitchToMonad={handleSwitchToMonad}
                isSwitchingNetwork={isSwitchingNetwork}
              />
              <div className="bg-black bg-opacity-30 rounded-lg px-4 py-2 flex items-center space-x-2 text-white">
                <span className="text-purple-400">⚡</span>
                <span className="font-bold">{gamePoints} spin power</span>
              </div>
            </div>
            
            {/* Network Warning */}
            {walletInfo && walletInfo.chainId !== 11155111 && walletInfo.chainId !== 10143 && (
              <div className="bg-orange-500 bg-opacity-20 border border-orange-500 rounded-lg p-3 max-w-md mx-auto mb-4">
                <div className="flex items-center justify-between text-orange-400 text-sm">
                  <div className="flex items-center space-x-2">
                    <Network className="w-4 h-4" />
                    <span>Switch to Sepolia or Monad for token claiming</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={handleSwitchToSepolia}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
                      disabled={isSwitchingNetwork}
                    >
                      {isSwitchingNetwork ? 'Switching...' : 'Sepolia'}
                    </button>
                    <button
                      onClick={handleSwitchToMonad}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
                      disabled={isSwitchingNetwork}
                    >
                      {isSwitchingNetwork ? 'Switching...' : 'Monad'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Claim Success Message */}
            {claimSuccess && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-3 max-w-md mx-auto mb-4">
                <div className="text-green-400 text-sm text-center">
                  {claimSuccess}
                </div>
              </div>
            )}
            
            {/* Token Info Toggle */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setShowTokenInfo(!showTokenInfo)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
              >
                <Coins className="w-4 h-4" />
                <span>{showTokenInfo ? 'Hide' : 'Show'} Token Info</span>
              </button>
            </div>
            
            {/* Token Info Panel */}
            {showTokenInfo && walletInfo && (
              <div className="mb-6">
                <TokenInfo 
                  walletAddress={walletInfo.address}
                  gamePoints={gamePoints}
                  onClaimSuccess={handleClaimSuccess}
                  onPointsConverted={handlePointsConverted}
                />
              </div>
            )}
          </div>

          {/* Spin Wheel */}
          <div className="text-center space-y-8">
            <SpinWheel />
            
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto disabled:scale-100"
            >
              <RotateCcw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Spinning...' : 'Spin to Win!'}</span>
            </button>
            
            {/* Reward Display */}
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              {SPIN_REWARDS.map((reward, index) => (
                <div key={index} className="bg-black bg-opacity-30 rounded-lg p-3 text-center hover:bg-opacity-40 transition-all">
                  <div className={`w-full h-2 ${reward.color} rounded mb-2`}></div>
                  <div className="text-white font-bold">{reward.multiplier}</div>
                  <div className="text-yellow-400 text-sm">{reward.coins} coins</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'spinning') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Monad Spin
              </span>
            </h1>
            <div className="flex justify-center items-center space-x-4 mb-4">
              <WalletConnection
                onConnect={connectWallet}
                onDisconnect={handleDisconnect}
                walletInfo={walletInfo}
                isConnecting={isConnecting}
                error={error}
                onSwitchToMonad={handleSwitchToMonad}
                isSwitchingNetwork={isSwitchingNetwork}
              />
              <div className="bg-black bg-opacity-30 rounded-lg px-4 py-2 flex items-center space-x-2 text-white">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">{balance.toLocaleString()} coins</span>
              </div>
            </div>
            
            {claimSuccess && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-3 max-w-md mx-auto mb-4">
                <div className="text-green-400 text-sm text-center">
                  {claimSuccess}
                </div>
              </div>
            )}
          </div>

          <div className="text-center space-y-8">
            <SpinWheel />
            <div className="text-2xl font-bold text-white animate-pulse">
              🎰 Spinning... Good luck! 🎰
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Monad Spin
              </span>
            </h1>
            <div className="flex justify-center items-center space-x-4 mb-4">
              <WalletConnection
                onConnect={connectWallet}
                onDisconnect={handleDisconnect}
                walletInfo={walletInfo}
                isConnecting={isConnecting}
                error={error}
                onSwitchToMonad={handleSwitchToMonad}
                isSwitchingNetwork={isSwitchingNetwork}
              />
              <div className="bg-black bg-opacity-30 rounded-lg px-4 py-2 flex items-center space-x-2 text-white">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">{balance.toLocaleString()} coins</span>
              </div>
            </div>
            
            {claimSuccess && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-3 max-w-md mx-auto mb-4">
                <div className="text-green-400 text-sm text-center">
                  {claimSuccess}
                </div>
              </div>
            )}
          </div>

          <div className="text-center space-y-8">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 max-w-md mx-auto transform animate-pulse shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">🎉 Congratulations! 🎉</h2>
              <div className="text-6xl font-bold text-white mb-2">
                {lastWin?.coins.toLocaleString()}
              </div>
              <div className="text-2xl text-white mb-4">COINS WON!</div>
              <div className="text-lg text-white opacity-90">
                Multiplier: {lastWin?.multiplier}
              </div>
            </div>
            
            <button
              onClick={claimCoins}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto animate-bounce"
            >
              <Coins className="w-6 h-6" />
              <span>Claim Coins</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'claimed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Monad Spin
              </span>
            </h1>
            <div className="flex justify-center items-center space-x-4 mb-4">
              <WalletConnection
                onConnect={connectWallet}
                onDisconnect={handleDisconnect}
                walletInfo={walletInfo}
                isConnecting={isConnecting}
                error={error}
                onSwitchToMonad={handleSwitchToMonad}
                isSwitchingNetwork={isSwitchingNetwork}
              />
              <div className="bg-black bg-opacity-30 rounded-lg px-4 py-2 flex items-center space-x-2 text-white">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">{balance.toLocaleString()} coins</span>
              </div>
            </div>
            
            {claimSuccess && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-3 max-w-md mx-auto mb-4">
                <div className="text-green-400 text-sm text-center">
                  {claimSuccess}
                </div>
              </div>
            )}
          </div>

          <div className="text-center space-y-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">✅ Coins Claimed! ✅</h2>
              <div className="text-xl text-white">
                {lastWin?.coins.toLocaleString()} spin power has been added to your balance!
              </div>
            </div>
            
            <div className="text-lg text-white">
              Redirecting to spin again...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;