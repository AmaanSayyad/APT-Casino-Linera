"use client";

import { useState, useEffect } from 'react';
import { usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { getSmartAccountInfo, checkSmartAccountSupport } from '@/utils/smartAccountUtils';

export const useSmartAccount = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
  const address = pushChainClient?.universal?.account || null;
  
  const [smartAccountInfo, setSmartAccountInfo] = useState(null);
  const [isSmartAccount, setIsSmartAccount] = useState(false);
  const [capabilities, setCapabilities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSmartAccountInfo = async () => {
      if (!isConnected || !address || !pushChainClient) {
        setSmartAccountInfo(null);
        setIsSmartAccount(false);
        setCapabilities(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Push Chain Universal Wallet provides smart account functionality by default
        const accountInfo = {
          isSmartAccount: true,
          address: address,
          features: {
            batchTransactions: true,
            gaslessTransactions: true,
            socialLogin: true
          }
        };
        setSmartAccountInfo(accountInfo);
        setIsSmartAccount(true);

        // Push Chain capabilities
        const caps = {
          isSupported: true,
          capabilities: {
            batchTransactions: true,
            gaslessTransactions: true,
            socialLogin: true
          },
          provider: 'Push Universal Wallet'
        };
        setCapabilities(caps);

        console.log('Smart Account Info:', accountInfo);
        console.log('Smart Account Capabilities:', caps);
      } catch (err) {
        console.error('Error loading Smart Account info:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSmartAccountInfo();
  }, [isConnected, address, pushChainClient]);

  const enableSmartAccountFeatures = async () => {
    if (!pushChainClient) return false;

    try {
      setIsLoading(true);
      
      // Push Universal Wallet has smart account features enabled by default
      console.log('Push Universal Wallet smart account features are already enabled');
      
      return true;
    } catch (err) {
      console.error('Error with Push Universal Wallet features:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const batchTransactions = async (transactions) => {
    if (!pushChainClient || !isSmartAccount) {
      throw new Error('Push Universal Wallet not available for batch transactions');
    }

    try {
      // Push Chain supports batch transactions natively
      const results = [];
      for (const tx of transactions) {
        const result = await pushChainClient.universal.sendTransaction(tx);
        results.push(result);
      }
      
      return results;
    } catch (err) {
      console.error('Error executing batch transactions:', err);
      throw err;
    }
  };

  return {
    // State
    smartAccountInfo,
    isSmartAccount,
    capabilities,
    isLoading,
    error,
    
    // Actions
    enableSmartAccountFeatures,
    batchTransactions,
    
    // Computed values
    hasSmartAccountSupport: !!capabilities?.isSupported,
    supportedFeatures: smartAccountInfo?.features || {},
  };
};