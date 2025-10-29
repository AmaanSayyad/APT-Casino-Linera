"use client";
import React from 'react';
import { useStacksWallet } from '@/contexts/StacksWalletContext';

/**
 * Global Wallet Manager for Stacks
 * This component manages Stacks wallet state globally
 */
export default function GlobalWalletManager() {
  const { isConnected, address, balance } = useStacksWallet();
  
  // Debug logging
  React.useEffect(() => {
    console.log('🔧 GlobalWalletManager (Stacks) state:', {
      isConnected,
      address,
      balance
    });
  }, [isConnected, address, balance]);
  
  // This component doesn't render anything, it just manages wallet state
  return null;
}
