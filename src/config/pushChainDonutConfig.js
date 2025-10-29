// Push Chain Donut Testnet Configuration
export const pushChainDonutConfig = {
  id: 42101,
  name: 'Push Chain Donut Testnet',
  network: 'push-chain-donut',
  nativeCurrency: {
    decimals: 18,
    name: 'PC',
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
};

export const pushChainDonutTokens = {
  PC: {
    address: 'native',
    decimals: 18,
    symbol: 'PC',
    name: 'Push Chain',
    isNative: true,
  },
};

export default pushChainDonutConfig;
