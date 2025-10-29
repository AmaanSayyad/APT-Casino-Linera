"use client";
import { useEffect, useRef } from 'react';
import { usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Vercel-specific Wallet Persistence Hook
 * Handles wallet persistence in Vercel's edge runtime environment
 */
export const useVercelWalletPersistence = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
  const address = pushChainClient?.universal?.account || null;
  const router = useRouter();
  const searchParams = useSearchParams();
  const reconnectAttempted = useRef(false);
  const reconnectTimeout = useRef(null);
  const lastPageCheck = useRef(0);

  // Global state for Vercel
  const globalState = useRef({
    isConnected: false,
    address: null,
    connector: null,
    lastReconnectAttempt: 0
  });

  // Update global state when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      globalState.current = {
        isConnected: true,
        address,
        connector: 'metaMask', // Default to MetaMask
        lastReconnectAttempt: 0
      };
      console.log('✅ Vercel wallet connected, updating global state:', globalState.current);
    }
  }, [isConnected, address]);

  // Check for wallet reconnection
  useEffect(() => {
    // Clear any existing timeout
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    const checkAndReconnect = () => {
      const currentTime = Date.now();
      
      console.log('🌐 Vercel Push Universal Wallet check:', {
        connectionStatus,
        isConnected,
        address,
        globalState: globalState.current,
        pushChainClient: !!pushChainClient,
        reconnectAttempted: reconnectAttempted.current,
        timeSinceLastCheck: currentTime - lastPageCheck.current,
        windowDefined: typeof window !== 'undefined'
      });

      // Update last check time
      lastPageCheck.current = currentTime;

      // Push Universal Wallet handles reconnection automatically
      // We just monitor the state
      const shouldReconnect = 
        !isConnected && 
        typeof window !== 'undefined' &&
        !reconnectAttempted.current;

      if (shouldReconnect) {
        console.log('🔄 Vercel Push Universal Wallet: Monitoring connection...');
        reconnectAttempted.current = true;

        // Push Universal Wallet handles reconnection internally
        setTimeout(() => {
          if (!isConnected) {
            console.log('❌ Push Universal Wallet reconnection timeout');
            reconnectAttempted.current = false;
          } else {
            console.log('✅ Push Universal Wallet reconnection successful');
            reconnectAttempted.current = false;
          }
        }, 5000);
      }
    };

    // Very short delay for Vercel - try to reconnect immediately
    const delay = 500;
    reconnectTimeout.current = setTimeout(checkAndReconnect, delay);

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [isConnected, address, connectionStatus, pushChainClient]);

  // Handle page navigation
  useEffect(() => {
    const handlePageNavigation = () => {
      console.log('🔄 Page navigation detected in Vercel');
      
      // Reset reconnection flag on page navigation
      reconnectAttempted.current = false;
      
      // Push Universal Wallet handles page navigation automatically
      if (globalState.current.isConnected && !isConnected) {
        console.log('🔄 Page navigation: Push Universal Wallet will handle reconnection...');
      }
    };

    // Run on every page load
    handlePageNavigation();
  }, [isConnected, connectionStatus, pushChainClient]);

  return {
    isConnected,
    address,
    isReconnecting: reconnectAttempted.current,
    globalState: globalState.current
  };
};
