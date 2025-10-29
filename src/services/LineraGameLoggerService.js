/**
 * Linera Game Logger Service
 * Oyun sonuçlarını Linera blockchain'e loglama servisi
 */

import LineraClient from './LineraClient.js';
import { LINERA_CONFIG } from '../config/lineraConfig.js';

export class LineraGameLoggerService {
  constructor() {
    this.client = new LineraClient();
    this.isInitialized = false;
    this.gameChains = new Map(); // sessionId -> chainId mapping
  }

  /**
   * Initialize the service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      // Test connection to Linera network
      const chainInfo = await this.client.getChainInfo();
      console.log('✅ Linera Game Logger Service initialized:', chainInfo);
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Linera network not available:', error.message);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Start a new game session
   * @param {Object} gameConfig - Game configuration
   * @returns {Promise<Object>} Game session result
   */
  async startGameSession(gameConfig) {
    if (!this.isInitialized) {
      return this.createFallbackSession(gameConfig);
    }

    try {
      const sessionId = `${gameConfig.gameType}_${gameConfig.playerAddress}_${Date.now()}`;
      
      // Create temporary chain for this game session
      const chainResult = await this.client.createGameChain({
        ...gameConfig,
        sessionId
      });

      if (chainResult.success) {
        this.gameChains.set(sessionId, chainResult.chainId);
        
        return {
          success: true,
          sessionId,
          chainId: chainResult.chainId,
          blockHeight: chainResult.blockHeight,
          messageId: chainResult.messageId
        };
      } else {
        throw new Error(chainResult.error);
      }
    } catch (error) {
      console.error('❌ Failed to start Linera game session:', error);
      return this.createFallbackSession(gameConfig);
    }
  }

  /**
   * Log game result to Linera
   * @param {Object} gameData - Game data to log
   * @returns {Promise<Object>} Logging result
   */
  async logGameResult(gameData) {
    if (!this.isInitialized) {
      throw new Error('Linera Game Logger Service not initialized');
    }

    try {
      // Validate game data
      if (!LINERA_CONFIG.validateGameData(gameData)) {
        throw new Error('Invalid game data structure');
      }

      const result = await this.client.logGameResult(gameData);
      
      if (result.success) {
        console.log('✅ Game result logged to Linera:', {
          chainId: result.chainId,
          blockHeight: result.blockHeight,
          messageId: result.messageId
        });

        return {
          success: true,
          chainId: result.chainId,
          blockHeight: result.blockHeight,
          messageId: result.messageId,
          lineraExplorerUrl: result.explorerUrl,
          timestamp: result.timestamp
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to log game result to Linera:', error);
      throw error;
    }
  }

  /**
   * End a game session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} End session result
   */
  async endGameSession(sessionId) {
    if (!this.isInitialized) {
      return { success: true, message: 'Fallback mode - session ended' };
    }

    try {
      const chainId = this.gameChains.get(sessionId);
      if (!chainId) {
        console.warn('⚠️ No chain found for session:', sessionId);
        return { success: true, message: 'No chain to close' };
      }

      const result = await this.client.closeChain(chainId);
      
      if (result.success) {
        this.gameChains.delete(sessionId);
        console.log('✅ Game session ended:', {
          sessionId,
          chainId: result.closedChainId
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to end game session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get game session info
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session info
   */
  async getGameSessionInfo(sessionId) {
    if (!this.isInitialized) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const chainId = this.gameChains.get(sessionId);
      if (!chainId) {
        return { success: false, error: 'Session not found' };
      }

      const chainInfo = await this.client.getChainInfo();
      
      return {
        success: true,
        sessionId,
        chainId,
        chainInfo
      };
    } catch (error) {
      console.error('❌ Failed to get session info:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create fallback session when Linera is not available
   * @param {Object} gameConfig - Game configuration
   * @returns {Object} Fallback session
   */
  createFallbackSession(gameConfig) {
    const sessionId = `fallback_${gameConfig.gameType}_${Date.now()}`;
    const chainId = `fallback_chain_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📝 Created fallback Linera session:', { sessionId, chainId });
    
    return {
      success: true,
      sessionId,
      chainId,
      blockHeight: Math.floor(Math.random() * 1000000),
      messageId: `fallback_${Math.random().toString(36).substr(2, 12)}`,
      fallback: true
    };
  }

  /**
   * Create fallback result when Linera is not available
   * @param {Object} gameData - Game data
   * @returns {Object} Fallback result
   */
  createFallbackResult(gameData) {
    const chainId = `fallback_chain_${Math.random().toString(36).substr(2, 9)}`;
    const blockHeight = Math.floor(Math.random() * 1000000) + 100000;
    const messageId = `fallback_msg_${Math.random().toString(36).substr(2, 12)}`;
    
    console.log('📝 Created fallback Linera result:', {
      chainId,
      blockHeight,
      messageId,
      gameType: gameData.gameType
    });

    return {
      success: true,
      chainId,
      blockHeight,
      messageId,
      lineraExplorerUrl: LINERA_CONFIG.getBlockExplorerUrl(chainId, blockHeight),
      timestamp: Date.now(),
      fallback: true
    };
  }

  /**
   * Check if service is ready
   * @returns {boolean} Ready status
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Get service status
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      activeGameChains: this.gameChains.size,
      rpcUrl: this.client.rpcUrl,
      chainId: this.client.chainId
    };
  }
}

// Export singleton instance
export const lineraGameLogger = new LineraGameLoggerService();
export default lineraGameLogger;