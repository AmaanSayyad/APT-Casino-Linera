/**
 * Push Chain Logger Utility
 * Oyun sonuçlarını Push Chain Donut testnet'e loglar
 */

export const logGameResultToPushChain = async (gameData) => {
  try {
    console.log('🎮 Logging game result to Push Chain:', gameData);

    const response = await fetch('/api/log-to-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Game result logged to Push Chain successfully');
      console.log('🔗 Transaction Hash:', result.transactionHash);
      console.log('🌐 Push Chain Explorer:', result.pushChainExplorerUrl);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        pushChainExplorerUrl: result.pushChainExplorerUrl,
        gameData: result.gameData
      };
    } else {
      console.error('❌ Failed to log game result to Push Chain:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error logging game result to Push Chain:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Oyun sonuçlarını hem entropy hem de Push Chain hem de Solana'ya loglar
 */
export const logCompleteGameResult = async (gameType, gameResult, playerAddress, betAmount, payout, entropyProof) => {
  const gameData = {
    gameType,
    gameResult,
    playerAddress,
    betAmount,
    payout,
    entropyProof
  };

  // Push Chain'e logla
  const pushResult = await logGameResultToPushChain(gameData);

  // Solana'ya logla
  let solanaResult = { success: false };
  try {
    const solanaResponse = await fetch('/api/log-to-solana', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });
    solanaResult = await solanaResponse.json();
  } catch (error) {
    console.error('❌ Error logging to Solana:', error);
    solanaResult = { success: false, error: error.message };
  }

  return {
    entropyProof,
    pushChainResult: pushResult,
    solanaResult: solanaResult,
    // Oyun history'si için birleştirilmiş data
    combinedResult: {
      ...gameResult,
      entropyProof,
      pushChainTxHash: pushResult.success ? pushResult.transactionHash : null,
      pushChainExplorerUrl: pushResult.success ? pushResult.pushChainExplorerUrl : null,
      solanaTxSignature: solanaResult.success ? solanaResult.transactionSignature : null,
      solanaExplorerUrl: solanaResult.success ? solanaResult.solanaExplorerUrl : null,
      timestamp: Date.now()
    }
  };
};

export default {
  logGameResultToPushChain,
  logCompleteGameResult
};