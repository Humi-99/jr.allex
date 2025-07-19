import React, { useState, useEffect } from 'react';
import { Coins, RotateCcw, Sparkles, AlertCircle, Network } from 'lucide-react';
import { walletService, WalletInfo } from './utils/wallet';
import { WalletConnection } from './components/WalletConnection';
import { TokenInfo } from './components/TokenInfo';

type GameState = 'disconnected' | 'connected' | 'spinning' | 'won' | 'claimed';

interface SpinResult {
  reward: string;
  project: string;
  color: string;
}

const NFT_WHITELIST_REWARDS = [
  { reward: 'Jog NFT WL', project: 'Jog', color: 'bg-blue-500' },
  { reward: 'Mulunduch NFT WL', project: 'Mulunduch', color: 'bg-green-500' },
  { reward: 'Pingo NFT WL', project: 'Pingo', color: 'bg-yellow-500' },
  { reward: 'GTD NFT WL', project: 'GTD', color: 'bg-purple-500' },
  { reward: 'Bored Apes NFT WL', project: 'BAYC', color: 'bg-pink-500' },
  { reward: 'CryptoPunks NFT WL', project: 'Punks', color: 'bg-red-500' },
  { reward: 'Azuki NFT WL', project: 'Azuki', color: 'bg-orange-500' },
  { reward: 'Doodles NFT WL', project: 'Doodles', color: 'bg-indigo-500' },
  { reward: 'Moonbirds NFT WL', project: 'Moonbirds', color: 'bg-cyan-500' },
  { reward: 'CloneX NFT WL', project: 'CloneX', color: 'bg-emerald-500' },
  { reward: 'Pudgy Penguins NFT WL', project: 'Pudgy', color: 'bg-teal-500' },
  { reward: 'DeGods NFT WL', project: 'DeGods', color: 'bg-amber-500' },
];

function App() {
  const [gameState, setGameState] = useState<GameState>('disconnected');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [lastWin, setLastWin] = useState<SpinResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [spinPower, setSpinPower] = useState(0);
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
      setSpinPower(0); // Reset game balance (separate from ETH balance)
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
    setSpinPower(0);
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
    setSpinPower(prev => prev - points);
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
    const result = NFT_WHITELIST_REWARDS[Math.floor(Math.random() * NFT_WHITELIST_REWARDS.length)];
    
    // Calculate rotation (multiple full rotations + final position)
    const segmentAngle = 360 / NFT_WHITELIST_REWARDS.length;
    const selectedIndex = NFT_WHITELIST_REWARDS.indexOf(result);
    const finalRotation = rotation + 1440 + (selectedIndex * segmentAngle) + Math.random() * segmentAngle;
    setRotation(finalRotation);
    
    // Wait for animation to complete
    setTimeout(() => {
      setLastWin(result);
      setSpinPower(prev => prev + 100); // Add spin power for winning
      setIsSpinning(false);
      setGameState('won');
    }, 3000);
  };

  const claimCoins = () => {
    if (lastWin) {
      setGameState('claimed');
      setTimeout(() => setGameState('connected'), 2000);
    }
  };

  const SpinWheel = () => (
    <div className="relative w-96 h-96 mx-auto">
      <div 
        className="w-full h-full rounded-full border-8 border-yellow-400 relative overflow-hidden transition-transform duration-3000 ease-out shadow-2xl"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {NFT_WHITELIST_REWARDS.map((reward, index) => {
          const segmentAngle = 360 / NFT_WHITELIST_REWARDS.length;
          const rotation = index * segmentAngle;
          
          return (
          <div
            key={index}
            className={`absolute w-full h-full ${reward.color} opacity-90 flex items-start justify-center`}
            style={{
              transform: `rotate(${rotation}deg)`,
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`
            }}
          >
            <div 
              className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white font-bold text-xs text-center leading-tight"
              style={{ 
                transform: `rotate(${segmentAngle / 2}deg)`,
                width: '80px'
              }}
            >
              <div className="text-[10px] font-extrabold drop-shadow-lg">
                {reward.project}
              </div>
              <div className="text-[8px] font-semibold opacity-90">
                NFT WL
              </div>
            </div>
          </div>
          );
        })}
      </div>
      
      {/* Center pointer */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-4 border-gray-800 z-10 shadow-lg flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
      
      {/* Top pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-yellow-400 z-10 drop-shadow-lg"></div>
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
                <span className="font-bold">{spinPower} spin power</span>
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
                  gamePoints={spinPower}
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
            <div className="grid grid-cols-3 gap-3 max-w-4xl mx-auto">
              {NFT_WHITELIST_REWARDS.map((reward, index) => (
                <div key={index} className="bg-black bg-opacity-30 rounded-lg p-3 text-center hover:bg-opacity-40 transition-all border border-gray-600">
                  <div className={`w-full h-2 ${reward.color} rounded mb-2`}></div>
                  <div className="text-white font-bold text-sm">{reward.project}</div>
                  <div className="text-yellow-400 text-xs">NFT Whitelist</div>
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
                <span className="text-purple-400">⚡</span>
                <span className="font-bold">{spinPower} spin power</span>
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
                {lastWin?.reward} has been added to your collection!
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