/**
 * Game History Utilities
 * Helper functions for saving and managing game results with VRF details
 */

/**
 * Save game result to history with both VRF and Stacks transaction details
 * @param {Object} gameData - Game result data
 * @returns {Promise<Object>} Saved game result
 */
export const saveGameResult = async (gameData) => {
  try {
    const {
      vrfRequestId,
      userAddress,
      gameType,
      gameConfig,
      resultData,
      betAmount,
      payoutAmount,
      vrfTransactionHash,
      vrfValue,
      entropyProof
    } = gameData;

    // Validate required fields
    if (!userAddress || !gameType || !gameConfig || !resultData) {
      throw new Error('Missing required game data fields');
    }

    // Log game result to Stacks blockchain first
    let stacksLogResult = null;
    try {
      const stacksResponse = await fetch('/api/log-game-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameType: gameType.toUpperCase(),
          gameResult: resultData,
          entropyProof: entropyProof,
          userAddress: userAddress,
          betAmount: betAmount || 0,
          winAmount: payoutAmount || 0
        })
      });

      if (stacksResponse.ok) {
        stacksLogResult = await stacksResponse.json();
        console.log('✅ Game result logged to Stacks:', stacksLogResult.txId);
      } else {
        console.warn('⚠️ Failed to log to Stacks, continuing...');
      }
    } catch (stacksError) {
      console.warn('⚠️ Stacks logging failed:', stacksError.message);
    }

    // Prepare request body with Stacks transaction info
    const requestBody = {
      vrfRequestId,
      userAddress,
      gameType: gameType.toUpperCase(),
      gameConfig,
      resultData,
      betAmount: betAmount ? betAmount.toString() : null,
      payoutAmount: payoutAmount ? payoutAmount.toString() : null,
      stacksTxId: stacksLogResult?.txId,
      stacksExplorerUrl: stacksLogResult?.stacksExplorerUrl
    };

    // Make API request (this might not exist, so we'll handle it gracefully)
    let response;
    try {
      response = await fetch('/api/games/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
    } catch (apiError) {
      console.warn('⚠️ Game save API not available, using localStorage');
      // Fallback to localStorage
      return saveToLocalStorage(gameData, stacksLogResult);
    }

    // If API is available, use it
    if (response && response.ok) {
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save game result');
      }
      console.log('✅ Game result saved successfully:', data.data?.gameResult?.id);
      return {
        success: true,
        gameResult: data.data?.gameResult,
        stacksLogResult
      };
    } else {
      // Fallback to localStorage
      return saveToLocalStorage(gameData, stacksLogResult);
    }

  } catch (error) {
    console.error('❌ Error saving game result:', error);
    // Fallback to localStorage on any error
    return saveToLocalStorage(gameData, stacksLogResult);
  }
};

/**
 * Fallback function to save game result to localStorage
 */
const saveToLocalStorage = (gameData, stacksLogResult) => {
  try {
    const {
      vrfRequestId,
      userAddress,
      gameType,
      gameConfig,
      resultData,
      betAmount,
      payoutAmount,
      entropyProof
    } = gameData;

    const gameResult = {
      id: Date.now().toString(),
      vrfRequestId,
      userAddress,
      gameType: gameType.toUpperCase(),
      gameConfig,
      resultData,
      betAmount: betAmount || 0,
      payoutAmount: payoutAmount || 0,
      timestamp: new Date().toISOString(),
      entropyProof,
      stacksTxId: stacksLogResult?.txId,
      stacksExplorerUrl: stacksLogResult?.stacksExplorerUrl,
      pythEntropyUrl: entropyProof?.arbiscanUrl ? 
        `${entropyProof.arbiscanUrl}/tx/${entropyProof.transactionHash}` : null
    };

    // Save to localStorage
    const existingHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    existingHistory.unshift(gameResult); // Add to beginning
    
    // Keep only last 100 games
    if (existingHistory.length > 100) {
      existingHistory.splice(100);
    }
    
    localStorage.setItem('gameHistory', JSON.stringify(existingHistory));

    console.log('✅ Game result saved to localStorage');

    return {
      success: true,
      gameResult,
      stacksLogResult
    };

  } catch (error) {
    console.error('❌ Error saving to localStorage:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get game history from localStorage
 */
export const getGameHistory = (userAddress = null, limit = 50) => {
  try {
    const history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    
    let filteredHistory = history;
    
    // Filter by user address if provided
    if (userAddress) {
      filteredHistory = history.filter(game => game.userAddress === userAddress);
    }
    
    // Apply limit
    if (limit) {
      filteredHistory = filteredHistory.slice(0, limit);
    }
    
    return filteredHistory;
  } catch (error) {
    console.error('❌ Error loading game history:', error);
    return [];
  }
};

/**
 * Clear game history
 */
export const clearGameHistory = () => {
  try {
    localStorage.removeItem('gameHistory');
    console.log('✅ Game history cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing game history:', error);
    return false;
  }
};