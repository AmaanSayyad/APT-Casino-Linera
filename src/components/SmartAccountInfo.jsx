"use client";

import React, { useState, useEffect } from 'react';
import { usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';

const SmartAccountInfo = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
  const address = pushChainClient?.universal?.account || null;
  const [smartAccountInfo, setSmartAccountInfo] = useState(null);
  const [isSmartAccount, setIsSmartAccount] = useState(false);

  useEffect(() => {
    const checkSmartAccount = async () => {
      if (!isConnected || !address || !pushChainClient) return;

      try {
        // Push Universal Wallet provides smart account functionality by default
        setIsSmartAccount(true);
        setSmartAccountInfo({
          address,
          type: 'Push Universal Smart Account',
          hasCode: true,
          features: ['Gasless Transactions', 'Social Login', 'Batch Transactions']
        });
      } catch (error) {
        console.error('Error checking smart account:', error);
        // Fallback to EOA
        setIsSmartAccount(false);
        setSmartAccountInfo({
          address,
          type: 'Externally Owned Account (EOA)',
          hasCode: false
        });
      }
    };

    checkSmartAccount();
  }, [isConnected, address, pushChainClient]);

  if (!isConnected || !smartAccountInfo) return null;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Address:</span>
          <span className="text-white font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Type:</span>
          <span className={`font-medium ${isSmartAccount ? 'text-blue-400' : 'text-green-400'}`}>
            {smartAccountInfo.type}
          </span>
        </div>
        {isSmartAccount && smartAccountInfo.features && (
          <div className="mt-2 p-2 bg-blue-900/30 rounded border border-blue-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300 text-xs">Push Universal Wallet Features</span>
            </div>
            <div className="space-y-1">
              {smartAccountInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                  <span className="text-blue-200 text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAccountInfo;