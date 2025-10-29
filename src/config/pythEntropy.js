/**
 * Pyth Entropy Configuration
 * Configuration for Pyth Network Entropy random number generation
 */

export const PYTH_ENTROPY_CONFIG = {
  // Supported networks
  NETWORKS: {
    'arbitrum-sepolia': {
      chainId: 421614,
      name: 'Arbitrum Sepolia',
      rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc',
      entropyContract: process.env.NEXT_PUBLIC_PYTH_ENTROPY_CONTRACT || '0x549ebba8036ab746611b4ffa1423eb0a4df61440', // Official Pyth Entropy contract
      entropyProvider: process.env.NEXT_PUBLIC_PYTH_ENTROPY_PROVIDER || '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344', // Official Pyth Entropy provider
      explorerUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_EXPLORER || 'https://sepolia.arbiscan.io',
      entropyExplorerUrl: 'https://entropy-explorer.pyth.network'
    },
    'arbitrum-one': {
      chainId: 42161,
      name: 'Arbitrum One',
      rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_ONE_RPC || 'https://arb1.arbitrum.io/rpc',
      entropyContract: '0x0000000000000000000000000000000000000000', // Will be updated with actual contract
      explorerUrl: 'https://arbiscan.io',
      entropyExplorerUrl: 'https://entropy-explorer.pyth.network'
    },
    'base-sepolia': {
      chainId: 84532,
      name: 'Base Sepolia',
      rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
      entropyContract: '0x0000000000000000000000000000000000000000', // Will be updated with actual contract
      explorerUrl: 'https://sepolia.basescan.org',
      entropyExplorerUrl: 'https://entropy-explorer.pyth.network'
    },
    'base': {
      chainId: 8453,
      name: 'Base',
      rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org',
      entropyContract: '0x0000000000000000000000000000000000000000', // Will be updated with actual contract
      explorerUrl: 'https://basescan.org',
      entropyExplorerUrl: 'https://entropy-explorer.pyth.network'
    },
    'blast': {
      chainId: 81457,
      name: 'Blast',
      rpcUrl: process.env.NEXT_PUBLIC_BLAST_RPC || 'https://rpc.blast.io',
      entropyContract: '0x0000000000000000000000000000000000000000', // Will be updated with actual contract
      explorerUrl: 'https://blastscan.io',
      entropyExplorerUrl: 'https://entropy-explorer.pyth.network'
    }
  },

  // Default network
  DEFAULT_NETWORK: 'arbitrum-sepolia',

  // Game types supported
  GAME_TYPES: {
    MINES: 0,
    PLINKO: 1,
    ROULETTE: 2,
    WHEEL: 3
  },

  // Entropy request configuration
  REQUEST_CONFIG: {
    // Gas limit for entropy requests
    gasLimit: 500000,
    // Maximum gas price (in wei)
    maxGasPrice: '1000000000', // 1 gwei
    // Request timeout (in milliseconds)
    timeout: 30000,
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000
  },

  // Entropy Explorer configuration
  EXPLORER_CONFIG: {
    baseUrl: 'https://entropy-explorer.pyth.network',
    // Supported chains for explorer
    supportedChains: ['arbitrum-sepolia', 'arbitrum-one', 'base-sepolia', 'base', 'blast'],
    // Transaction link format
    transactionLinkFormat: 'https://entropy-explorer.pyth.network/tx/{txHash}'
  },

  /**
   * Get network configuration by chain ID or name
   * @param {string|number} network - Network name or chain ID
   * @returns {Object} Network configuration
   */
  getNetworkConfig(network) {
    if (typeof network === 'number') {
      const networkEntry = Object.entries(this.NETWORKS).find(([_, config]) => config.chainId === network);
      return networkEntry ? networkEntry[1] : null;
    }
    return this.NETWORKS[network] || this.NETWORKS[this.DEFAULT_NETWORK];
  },

  /**
   * Get entropy contract address for network
   * @param {string} network - Network name
   * @returns {string} Contract address
   */
  getEntropyContract(network) {
    const config = this.getNetworkConfig(network);
    return config?.entropyContract || '0x0000000000000000000000000000000000000000';
  },

  /**
   * Get explorer URL for transaction
   * @param {string} txHash - Transaction hash
   * @param {string} network - Network name
   * @returns {string} Explorer URL
   */
  getExplorerUrl(txHash, network) {
    const config = this.getNetworkConfig(network);
    return `${config.explorerUrl}/tx/${txHash}`;
  },

  /**
   * Get Entropy Explorer URL for transaction
   * @param {string} txHash - Transaction hash
   * @returns {string} Entropy Explorer URL
   */
  getEntropyExplorerUrl(txHash) {
    return `https://entropy-explorer.pyth.network/tx/${txHash}`;
  },

  /**
   * Validate network support
   * @param {string} network - Network name
   * @returns {boolean} True if supported
   */
  isNetworkSupported(network) {
    return network in this.NETWORKS;
  },

  /**
   * Get all supported networks
   * @returns {Array} Array of network names
   */
  getSupportedNetworks() {
    return Object.keys(this.NETWORKS);
  }
};

export default PYTH_ENTROPY_CONFIG;
