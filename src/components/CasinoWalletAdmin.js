"use client";

import React, { useState, useEffect } from 'react';
import { CasinoWallet, casinoWallet } from '@/utils/casinoWallet';

const CasinoWalletAdmin = () => {
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [treasuryAddress, setTreasuryAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newWallet, setNewWallet] = useState(null);
  const [showNewWallet, setShowNewWallet] = useState(false);
  const [allDeposits, setAllDeposits] = useState([]);
  const [allWithdrawals, setAllWithdrawals] = useState([]);

  useEffect(() => {
    loadTreasuryInfo();
    loadTransactions();
  }, []);

  const loadTreasuryInfo = async () => {
    setIsLoading(true);
    try {
      const address = casinoWallet.getTreasuryAddress();
      setTreasuryAddress(address || 'Not configured');
      
      if (address) {
        const balance = await casinoWallet.getTreasuryBalance();
        setTreasuryBalance(balance);
      }
    } catch (error) {
      console.error('Failed to load treasury info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = () => {
    try {
      const deposits = JSON.parse(localStorage.getItem('casinoDeposits') || '[]');
      const withdrawals = JSON.parse(localStorage.getItem('casinoWithdrawals') || '[]');
      setAllDeposits(deposits);
      setAllWithdrawals(withdrawals);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const generateNewWallet = () => {
    const wallet = CasinoWallet.generateTreasuryWallet();
    setNewWallet(wallet);
    setShowNewWallet(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const totalDeposits = allDeposits.reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawals = allWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Casino Wallet Administration</h1>
        
        {/* Treasury Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm mb-1">Treasury Address</h3>
            <div className="text-white font-mono text-sm break-all">
              {treasuryAddress}
              {treasuryAddress !== 'Not configured' && (
                <button
                  onClick={() => copyToClipboard(treasuryAddress)}
                  className="ml-2 text-cyan-400 hover:text-cyan-300"
                >
                  📋
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm mb-1">Treasury Balance</h3>
            <div className="text-white text-xl font-bold">
              {isLoading ? 'Loading...' : `${treasuryBalance.toFixed(2)} STX`}
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm mb-1">Network</h3>
            <div className="text-white">
              {process.env.NODE_ENV === 'production' ? 'Mainnet' : 'Testnet'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={loadTreasuryInfo}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Balance'}
          </button>
          
          <button
            onClick={generateNewWallet}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Generate New Wallet
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-green-400 text-sm mb-1">Total Deposits</h3>
            <div className="text-white text-xl font-bold">{totalDeposits.toFixed(2)} STX</div>
            <div className="text-green-300 text-sm">{allDeposits.length} transactions</div>
          </div>
          
          <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 text-sm mb-1">Total Withdrawals</h3>
            <div className="text-white text-xl font-bold">{totalWithdrawals.toFixed(2)} STX</div>
            <div className="text-red-300 text-sm">{allWithdrawals.length} transactions</div>
          </div>
          
          <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
            <h3 className="text-purple-400 text-sm mb-1">Net Balance</h3>
            <div className="text-white text-xl font-bold">{(totalDeposits - totalWithdrawals).toFixed(2)} STX</div>
            <div className="text-purple-300 text-sm">Casino profit/loss</div>
          </div>
        </div>
      </div>

      {/* New Wallet Modal */}
      {showNewWallet && newWallet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">New Treasury Wallet Generated</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Mnemonic Phrase</label>
                <div className="bg-black/50 rounded-lg p-3 font-mono text-sm text-white break-all">
                  {newWallet.mnemonic}
                  <button
                    onClick={() => copyToClipboard(newWallet.mnemonic)}
                    className="ml-2 text-cyan-400 hover:text-cyan-300"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Private Key</label>
                <div className="bg-black/50 rounded-lg p-3 font-mono text-sm text-white break-all">
                  {newWallet.privateKey}
                  <button
                    onClick={() => copyToClipboard(newWallet.privateKey)}
                    className="ml-2 text-cyan-400 hover:text-cyan-300"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Address</label>
                <div className="bg-black/50 rounded-lg p-3 font-mono text-sm text-white break-all">
                  {newWallet.address}
                  <button
                    onClick={() => copyToClipboard(newWallet.address)}
                    className="ml-2 text-cyan-400 hover:text-cyan-300"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                ⚠️ <strong>Important:</strong> Store these credentials securely! 
                Add the private key to your environment variables as CASINO_TREASURY_PRIVATE_KEY.
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowNewWallet(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposits */}
          <div>
            <h3 className="text-green-400 font-medium mb-3">Recent Deposits</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allDeposits.slice(-10).reverse().map((deposit) => (
                <div key={deposit.id} className="bg-black/30 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium">{deposit.amount} STX</div>
                      <div className="text-gray-400 text-sm">{formatAddress(deposit.userAddress)}</div>
                      <div className="text-gray-500 text-xs">{formatDate(deposit.timestamp)}</div>
                    </div>
                    <div className="text-green-400 text-sm">+{deposit.amount}</div>
                  </div>
                </div>
              ))}
              {allDeposits.length === 0 && (
                <div className="text-gray-400 text-center py-4">No deposits yet</div>
              )}
            </div>
          </div>
          
          {/* Withdrawals */}
          <div>
            <h3 className="text-red-400 font-medium mb-3">Recent Withdrawals</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allWithdrawals.slice(-10).reverse().map((withdrawal) => (
                <div key={withdrawal.id} className="bg-black/30 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium">{withdrawal.amount} STX</div>
                      <div className="text-gray-400 text-sm">{formatAddress(withdrawal.userAddress)}</div>
                      <div className="text-gray-500 text-xs">{formatDate(withdrawal.timestamp)}</div>
                    </div>
                    <div className="text-red-400 text-sm">-{withdrawal.amount}</div>
                  </div>
                </div>
              ))}
              {allWithdrawals.length === 0 && (
                <div className="text-gray-400 text-center py-4">No withdrawals yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoWalletAdmin;