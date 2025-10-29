"use client";

import React, { useState } from 'react';
import { useStacksWallet } from '@/contexts/StacksWalletContext';

const StacksWalletButton = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    isLoading, 
    connectWallet, 
    disconnectWallet 
  } = useStacksWallet();
  
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const walletOptions = [
    {
      name: 'Leather Wallet',
      id: 'leather',
      icon: '🔗',
      description: 'Connect with Leather Wallet'
    },
    {
      name: 'Xverse Wallet',
      id: 'xverse', 
      icon: '⚡',
      description: 'Connect with Xverse Wallet'
    },
    {
      name: 'Ryder Wallet',
      id: 'ryder',
      icon: '🚀',
      description: 'Connect with Ryder Wallet'
    }
  ];

  const handleConnect = async (walletType) => {
    await connectWallet(walletType);
    setShowWalletOptions(false);
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal) => {
    return parseFloat(bal).toFixed(2);
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-2">
          <div className="text-white text-sm font-medium">
            {formatAddress(address)}
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowWalletOptions(!showWalletOptions)}
        disabled={isLoading}
        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {showWalletOptions && (
        <div className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 min-w-[280px] z-50">
          <h3 className="text-white font-medium mb-3">Choose Wallet</h3>
          <div className="space-y-2">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                className="w-full flex items-center gap-3 p-3 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 rounded-lg transition-all duration-200 text-left"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <div className="text-white font-medium">{wallet.name}</div>
                  <div className="text-gray-400 text-sm">{wallet.description}</div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowWalletOptions(false)}
            className="w-full mt-3 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default StacksWalletButton;