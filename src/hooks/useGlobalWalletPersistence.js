"use client";
import { useEffect, useRef } from 'react';
import { usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { memoryWalletStorage as walletStorage } from '@/utils/memoryWalletStorage';

/**
 * Global Wallet Persistence Hook
 * Works across all pages and components with Push Universal Wallet
 */
export const useGlobalWalletPersistence = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  
  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
  const address = pushChainClient?.universal?.account || null;
  const reconnectAttempted = useRef(false);
  const reconnectTimeout = useRef(null);
  const lastPageCheck = useRef(0);

  useEffect(() => {
    // Clear any existing timeout
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    // Check if we need to reconnect
    const checkAndReconnect = () => {
      // Use safe storage utility
      const { wasConnected, address: savedAddress } = walletStorage.getConnectionState();
      const currentTime = Date.now();
      
      console.log('🌐 Push Universal Wallet check:', {
        wasConnected,
        savedAddress,
        isConnected,
        address,
        connectionStatus,
        reconnectAttempted: reconnectAttempted.current,
        timeSinceLastCheck: currentTime - lastPageCheck.current,
        windowDefined: typeof window !== 'undefined',
        globalState: walletStorage.getGlobalState()
      });

      // Update last check time
      lastPageCheck.current = currentTime;

      // Push Universal Wallet handles reconnection automatically
      // We just need to track the state
      const lastReconnectAttempt = walletStorage.getLastReconnectAttempt();
      const timeSinceLastAttempt = currentTime - lastReconnectAttempt;
      const cooldown = process.env.NODE_ENV === 'production' ? 2000 : 5000;
      const canAttemptReconnect = timeSinceLastAttempt > cooldown;
      
      if ((wasConnected || savedAddress) && !isConnected && canAttemptReconnect && typeof window !== 'undefined') {
        console.log('🔄 Push Universal Wallet: Checking connection status...');
        reconnectAttempted.current = true;
        walletStorage.setLastReconnectAttempt(currentTime);
        
        // Push Universal Wallet handles reconnection internally
        // We just monitor the status
        setTimeout(() => {
          if (!isConnected) {
            console.log('❌ Push Universal Wallet reconnection timeout');
            reconnectAttempted.current = false;
          }
        }, 5000);
      }
    };

    // Add delay to ensure connectors are ready
    // Shorter delay for Vercel environment
    const delay = process.env.NODE_ENV === 'production' ? 1000 : 2000;
    reconnectTimeout.current = setTimeout(checkAndReconnect, delay);

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [isConnected, address, connectionStatus]);

  // Save connection state when wallet connects
  useEffect(() => {
    if (isConnected && address && typeof window !== 'undefined') {
      console.log('✅ Push Universal Wallet connected, saving state');
      
      // Use safe storage utility
      const success = walletStorage.saveConnectionState(address, 'push-universal-wallet');
      
      if (success) {
        console.log('💾 Saved Push Universal Wallet connection');
        // Reset reconnection flag and clear last attempt time
        reconnectAttempted.current = false;
        walletStorage.clearLastReconnectAttempt();
      }
    }
  }, [isConnected, address]);

  // Clear connection state when wallet disconnects
  useEffect(() => {
    if (!isConnected && !reconnectAttempted.current && typeof window !== 'undefined') {
      console.log('❌ Global wallet disconnected, clearing state');
      walletStorage.clearConnectionState();
    }
  }, [isConnected, reconnectAttempted]);

  return {
    isConnected,
    address,
    isReconnecting: reconnectAttempted.current
  };
};
