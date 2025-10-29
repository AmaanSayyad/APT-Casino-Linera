/**
 * Pyth Entropy Configuration for Push Chain Donut Testnet
 * Configuration for Pyth Network Entropy random number generation
 */

export const PYTH_ENTROPY_CONFIG = {
  // Primary network - Push Chain Donut Testnet
  NETWORK: {
    chainId: 42101,
    name: 'Push Chain Donut Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_PUSH_CHAIN_RPC || 'https://evm.rpc-testnet-donut-node1.push.org/',
    entropyContract: process.env.NEXT_PUBLIC_PUSH_CHAIN_ENTROPY_CONTRACT || '0x36825bf3fbdf5a29e2d5148bfe7dcf7b5639e320',
    entropyProvider: process.env.NEXT_PUBLIC_PUSH_CHAIN_ENTROPY_PROVIDER || '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
    explorerUrl: process.env.NEXT_PUBLIC_PUSH_CHAIN_EXPLORER || 'https://donut.push.network',
    entropyExplorerUrl: 'https://entropy-explorer.pyth.network/?chain=push-chain-donut&search=',
    currency: 'PC',
    currencySymbol: 'PC',
    currencyDecimals: 18
  },

  // Supported networks (for backward compatibility)
  NETWORKS: {
    'push-chain-donut': {
      chainId: 42101,
      name: 'Push Chain Donut Testnet',
      rpcUrl: process.env.NEXT_PUBLIC_PUSH_CHAIN_RPC || 'https://evm.rpc-testnet-donut-node1.push.org/',
      entropyContract: process.env.NEXT_PUBLIC_PUSH_CHAIN_ENTROPY_CONTRACT || '0x36825bf3fbdf5a29e2d5148bfe7dcf7b5639e320',
      entropyProvider: process.env.NEXT_PUBLIC_PUSH_CHAIN_ENTROPY_PROVIDER || '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
      explorerUrl: process.env.NEXT_PUBLIC_PUSH_CHAIN_EXPLORER || 'https://donut.push.network',
      entropyExplorerUrl: 'https://entropy-explorer.pyth.network/?chain=push-chain-donut&search=',
      currency: 'PC',
      currencySymbol: 'PC',
      currencyDecimals: 18
    }
  },

  // Default network
  DEFAULT_NETWORK: 'push-chain-donut',

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
    supportedChains: ['push-chain-donut'],
    // Transaction link format
    transactionLinkFormat: 'https://entropy-explorer.pyth.network/tx/{txHash}',
    // Push Chain Donut Testnet specific explorer
    pushChainDonutUrl: 'https://entropy-explorer.pyth.network/?chain=push-chain-donut&search='
  },

  /**
   * Get network configuration by chain ID or name
   * @param {string|number} network - Network name or chain ID
   * @returns {Object} Network configuration
   */
  getNetworkConfig(network) {
    // Always return Push Chain Donut Testnet configuration
    if (typeof network === 'number' && network === 42101) {
      return this.NETWORK;
    }
    if (network === 'push-chain-donut' || !network) {
      return this.NETWORK;
    }
    // Fallback to primary network
    return this.NETWORK;
  },

  /**
   * Get entropy contract address for network
   * @param {string} network - Network name
   * @returns {string} Contract address
   */
  getEntropyContract(network) {
    // Always return Push Chain Donut Testnet entropy contract
    return this.NETWORK.entropyContract;
  },

  /**
   * Get entropy provider address for network
   * @param {string} network - Network name
   * @returns {string} Provider address
   */
  getEntropyProvider(network) {
    // Always return Push Chain Donut Testnet entropy provider
    return this.NETWORK.entropyProvider;
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
    if (txHash) {
      return `https://entropy-explorer.pyth.network/?chain=push-chain-donut&search=${txHash}`;
    }
    return this.NETWORK.entropyExplorerUrl;
  },

  /**
   * Validate network support
   * @param {string|number} network - Network name or chain ID
   * @returns {boolean} True if supported
   */
  isNetworkSupported(network) {
    if (typeof network === 'number') {
      return network === 42101; // Push Chain Donut Testnet chain ID
    }
    return network === 'push-chain-donut' || !network;
  },

  /**
   * Get all supported networks
   * @returns {Array} Array of network names
   */
  getSupportedNetworks() {
    return ['push-chain-donut'];
  },

  /**
   * Get current network configuration
   * @returns {Object} Current network configuration
   */
  getCurrentNetwork() {
    return this.NETWORK;
  },

  /**
   * Check if current network is Push Chain Donut Testnet
   * @returns {boolean} True if Push Chain Donut Testnet
   */
  isPushChainDonut() {
    return true; // Always true since we only support Push Chain Donut Testnet
  }
};

export default PYTH_ENTROPY_CONFIG;
