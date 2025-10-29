"use client";

import React, { useState } from 'react';
import { useStacksWallet } from '@/contexts/StacksWalletContext';
import { 
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const StacksDepositWithdraw = () => {
  const { isConnected, address, balance, userSession } = useStacksWallet();
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [txId, setTxId] = useState('');

  // Casino treasury address from environment
  const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_CASINO_TREASURY_ADDRESS || 'STZ2YCW72SDSCVYQKEPC3PNQ7J69EFTFERHEPC9';

  const network = new StacksTestnet(); // Use testnet for development

  const handleDeposit = async () => {
    if (!isConnected || !amount || !userSession) return;

    setIsDepositing(true);
    try {
      const amountInMicroSTX = Math.floor(parseFloat(amount) * 1000000);

      const txOptions = {
        recipient: TREASURY_ADDRESS,
        amount: amountInMicroSTX,
        senderKey: userSession.loadUserData().appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        memo: 'Casino Deposit'
      };

      const transaction = await makeSTXTokenTransfer(txOptions);
      const result = await broadcastTransaction(transaction, network);
      
      setTxId(result.txid);
      setAmount('');
      
      // Show success notification
      alert(`Deposit successful! Transaction ID: ${result.txid}`);
      
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Deposit failed: ' + error.message);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !amount) return;

    setIsWithdrawing(true);
    try {
      // This would typically call your casino's smart contract
      // For now, we'll show a placeholder
      
      // In a real implementation, you would:
      // 1. Call your casino smart contract's withdraw function
      // 2. Verify the user has sufficient casino balance
      // 3. Execute the withdrawal transaction
      
      alert('Withdraw functionality will be implemented with smart contract integration');
      
    } catch (error) {
      console.error('Withdraw failed:', error);
      alert('Withdraw failed: ' + error.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-white text-lg font-medium mb-2">Deposit & Withdraw</h3>
        <p className="text-gray-400">Please connect your Stacks wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
      <h3 className="text-white text-lg font-medium mb-4">Deposit & Withdraw STX</h3>
      
      <div className="mb-4">
        <div className="text-gray-400 text-sm mb-1">Wallet Balance</div>
        <div className="text-white text-xl font-bold">{balance.toFixed(2)} STX</div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Amount (STX)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            step="0.01"
            min="0"
            max={balance}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDeposit}
            disabled={!amount || isDepositing || parseFloat(amount) > balance}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            {isDepositing ? 'Depositing...' : 'Deposit'}
          </button>

          <button
            onClick={handleWithdraw}
            disabled={!amount || isWithdrawing}
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
          </button>
        </div>
      </div>

      {txId && (
        <div className="mt-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg">
          <div className="text-green-400 text-sm font-medium">Transaction Successful!</div>
          <div className="text-gray-300 text-xs mt-1 break-all">
            TX ID: {txId}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>• Deposits are sent to the casino treasury</p>
        <p>• Withdrawals require sufficient casino balance</p>
        <p>• All transactions are recorded on Stacks blockchain</p>
      </div>
    </div>
  );
};

export default StacksDepositWithdraw;