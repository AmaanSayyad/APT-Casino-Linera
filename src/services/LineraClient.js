/**
 * Linera Blockchain Client
 * Gerçek Linera blockchain ile etkileşim için client
 */

import axios from 'axios';
import { LINERA_CONFIG } from '../config/lineraConfig.js';

export class LineraClient {
  constructor(config = {}) {
    this.rpcUrl = config.rpcUrl || LINERA_CONFIG.NETWORK.rpcUrl;
    this.chainId = config.chainId || LINERA_CONFIG.NETWORK.chainId;
    this.applicationId = config.applicationId || LINERA_CONFIG.NETWORK.applicationId;
    this.timeout = config.timeout || 10000;
    
    // HTTP client for GraphQL queries
    this.httpClient = axios.create({
      baseURL: this.rpcUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Execute a GraphQL query on Linera
   * @param {string} query - GraphQL query
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>} Query result
   */
  async executeQuery(query, variables = {}) {
    try {
      const response = await this.httpClient.post('', {
        query,
        variables
      });

      if (response.data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.data;
    } catch (error) {
      console.error('❌ Linera GraphQL query failed:', error);
      throw error;
    }
  }

  /**
   * Execute an operation on Linera chain
   * @param {Object} operation - Operation to execute
   * @returns {Promise<Object>} Operation result
   */
  async executeOperation(operation) {
    try {
      const mutation = `
        mutation ExecuteOperation($chainId: String!, $operation: String!) {
          executeOperation(chainId: $chainId, operation: $operation) {
            hash
            blockHeight
            timestamp
          }
        }
      `;

      const variables = {
        chainId: this.chainId,
        operation: JSON.stringify(operation)
      };

      const result = await this.executeQuery(mutation, variables);
      return result.executeOperation;
    } catch (error) {
      console.error('❌ Linera operation execution failed:', error);
      throw error;
    }
  }

  /**
   * Create a temporary chain for game session
   * @param {Object} gameConfig - Game configuration
   * @returns {Promise<Object>} Chain creation result
   */
  async createGameChain(gameConfig) {
    try {
      const operation = {
        type: 'CreateGameChain',
        gameType: gameConfig.gameType,
        playerAddress: gameConfig.playerAddress,
        sessionId: gameConfig.sessionId,
        timestamp: Date.now()
      };

      const result = await this.executeOperation(operation);
      
      return {
        success: true,
        chainId: `game_${result.hash}`,
        blockHeight: result.blockHeight,
        messageId: result.hash,
        timestamp: result.timestamp
      };
    } catch (error) {
      console.error('❌ Failed to create game chain:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log game result to Linera blockchain
   * @param {Object} gameData - Game data to log
   * @returns {Promise<Object>} Logging result
   */
  async logGameResult(gameData) {
    try {
      // Format game data for Linera
      const lineraGameData = LINERA_CONFIG.formatGameDataForLinera(gameData);
      
      const operation = {
        type: LINERA_CONFIG.OPERATIONS.LOG_GAME_RESULT,
        data: lineraGameData
      };

      const result = await this.executeOperation(operation);
      
      return {
        success: true,
        chainId: this.chainId,
        blockHeight: result.blockHeight,
        messageId: result.hash,
        timestamp: result.timestamp,
        explorerUrl: LINERA_CONFIG.getBlockExplorerUrl(this.chainId, result.blockHeight)
      };
    } catch (error) {
      console.error('❌ Failed to log game result to Linera:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get chain information
   * @returns {Promise<Object>} Chain info
   */
  async getChainInfo() {
    try {
      const query = `
        query GetChainInfo($chainId: String!) {
          chain(chainId: $chainId) {
            id
            blockHeight
            timestamp
            description
          }
        }
      `;

      const variables = { chainId: this.chainId };
      const result = await this.executeQuery(query, variables);
      
      return result.chain;
    } catch (error) {
      console.error('❌ Failed to get chain info:', error);
      throw error;
    }
  }

  /**
   * Send a message to another chain
   * @param {string} targetChainId - Target chain ID
   * @param {Object} message - Message to send
   * @returns {Promise<Object>} Message result
   */
  async sendMessage(targetChainId, message) {
    try {
      const operation = {
        type: 'SendMessage',
        targetChainId,
        message,
        timestamp: Date.now()
      };

      const result = await this.executeOperation(operation);
      
      return {
        success: true,
        messageId: result.hash,
        blockHeight: result.blockHeight,
        timestamp: result.timestamp
      };
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Close a temporary chain
   * @param {string} chainId - Chain ID to close
   * @returns {Promise<Object>} Close result
   */
  async closeChain(chainId) {
    try {
      const operation = {
        type: 'CloseChain',
        chainId,
        timestamp: Date.now()
      };

      const result = await this.executeOperation(operation);
      
      return {
        success: true,
        closedChainId: chainId,
        blockHeight: result.blockHeight,
        timestamp: result.timestamp
      };
    } catch (error) {
      console.error('❌ Failed to close chain:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get application state
   * @returns {Promise<Object>} Application state
   */
  async getApplicationState() {
    try {
      const query = `
        query GetApplicationState($chainId: String!, $applicationId: String!) {
          application(chainId: $chainId, applicationId: $applicationId) {
            id
            description
            state
          }
        }
      `;

      const variables = {
        chainId: this.chainId,
        applicationId: this.applicationId
      };

      const result = await this.executeQuery(query, variables);
      return result.application;
    } catch (error) {
      console.error('❌ Failed to get application state:', error);
      throw error;
    }
  }
}

export default LineraClient;