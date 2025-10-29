/**
 * Custom Chain Definitions
 * Defines custom chains not included in wagmi/chains
 */

import { defineChain } from 'viem';

// Push Chain Donut Testnet Chain Definition
export const pushChainDonut = defineChain({
  id: 42101,
  name: 'Push Chain Donut Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Push Chain',
    symbol: 'PC',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.rpc-testnet-donut-node1.push.org/'],
    },
    public: {
      http: ['https://evm.rpc-testnet-donut-node1.push.org/', 'https://evm.rpc-testnet-donut-node2.push.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Push Chain Explorer',
      url: 'https://donut.push.network',
    },
  },
  testnet: true,
});

export default {
  pushChainDonut,
};