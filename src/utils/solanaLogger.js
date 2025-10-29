/**
 * Solana Logger Utility
 * Oyun sonuçlarını Solana testnet'e loglar
 */

export const logGameResultToSolana = async (gameData) => {
  try {
    console.log('🎮 Logging game result to Solana:', gameData);

    const response = await fetch('/api/log-to-solana', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Game result logged to Solana successfully');
      console.log('🔗 Transaction Signature:', result.transactionSignature);
      console.log('🌐 Solana Explorer:', result.solanaExplorerUrl);
      
      return {
        success: true,
        transactionSignature: result.transactionSignature,
        slot: result.slot,
        solanaExplorerUrl: result.solanaExplorerUrl,
        gameData: result.gameData
      };
    } else {
      console.error('❌ Failed to log game result to Solana:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error logging game result to Solana:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Oyun sonuçlarını hem entropy hem de Push Chain hem de Solana'ya loglar
 */
export const logCompleteGameResultWithSolana = async (gameType, gameResult, playerAddress, betAmount, payout, entropyProof) => {
  const gameData = {
    gameType,
    gameResult,
    playerAddress,
    betAmount,
    payout,
    entropyProof
  };

  // Solana'ya logla
  const solanaResult = await logGameResultToSolana(gameData);

  return {
    entropyProof,
    solanaResult: solanaResult,
    // Oyun history'si için birleştirilmiş data
    combinedResult: {
      ...gameResult,
      entropyProof,
      solanaTxSignature: solanaResult.success ? solanaResult.transactionSignature : null,
      solanaExplorerUrl: solanaResult.success ? solanaResult.solanaExplorerUrl : null,
      timestamp: Date.now()
    }
  };
};

export default {
  logGameResultToSolana,
  logCompleteGameResultWithSolana
};