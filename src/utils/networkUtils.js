// Network utilities for Push Chain Donut Testnet
import { pushChainDonut } from '@/config/chains';

export const PUSH_CHAIN_DONUT_CONFIG = {
  chainId: '0xa475', // 42101 in hex
  chainName: 'Push Chain Donut Testnet',
  nativeCurrency: {
    name: 'Push Chain',
    symbol: 'PC',
    decimals: 18,
  },
  rpcUrls: ['https://evm.rpc-testnet-donut-node1.push.org/'],
  blockExplorerUrls: ['https://donut.push.network'],
};

export const switchToPushChainDonut = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to Push Chain Donut Testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: PUSH_CHAIN_DONUT_CONFIG.chainId }],
    });
  } catch (switchError) {
    // If the chain is not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [PUSH_CHAIN_DONUT_CONFIG],
        });
      } catch (addError) {
        throw new Error('Failed to add Push Chain Donut Testnet to MetaMask');
      }
    } else {
      throw new Error('Failed to switch to Push Chain Donut Testnet');
    }
  }
};

export const isPushChainDonut = (chainId) => {
  return chainId === 42101 || chainId === '0xa475';
};

export const formatPCBalance = (balance, decimals = 5) => {
  const numBalance = parseFloat(balance || '0');
  return `${numBalance.toFixed(decimals)} PC`;
};

export const getPushChainExplorerUrl = (txHash) => {
  return `https://donut.push.network/tx/${txHash}`;
};