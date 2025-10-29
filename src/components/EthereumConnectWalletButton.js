"use client";
import React from 'react';
import { PushUniversalAccountButton, usePushWalletContext } from '@pushchain/ui-kit';

export default function EthereumConnectWalletButton() {
  const { connectionStatus } = usePushWalletContext();

  React.useEffect(() => {
    if (connectionStatus) {
      console.log('🔗 Push Wallet connection status:', connectionStatus);
    }
  }, [connectionStatus]);

  return (
    <div className="relative">
      <PushUniversalAccountButton />
    </div>
  );
} 