/**
 * Linera Logger Utility
 * Oyun sonuçlarını Linera blockchain'e loglar
 * Linera'nın fast game logic yapısını kullanır
 */

export const logGameResultToLinera = async (gameData) => {
  try {
    console.log('🎮 Logging game result to Linera:', gameData);

    const response = await fetch('/api/log-to-linera', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Game result logged to Linera successfully');
      console.log('🔗 Chain ID:', result.chainId);
      console.log('🔗 Block Height:', result.blockHeight);
      console.log('🌐 Linera Explorer:', result.lineraExplorerUrl);
      
      return {
        success: true,
        chainId: result.chainId,
        blockHeight: result.blockHeight,
        messageId: result.messageId,
        lineraExplorerUrl: result.lineraExplorerUrl,
        gameData: result.gameData
      };
    } else {
      console.error('❌ Failed to log game result to Linera:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error logging game result to Linera:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Oyun sonuçlarını Push Chain, Solana ve Linera'ya loglar
 */
export const logCompleteGameResultWithLinera = async (gameType, gameResult, playerAddress, betAmount, payout, entropyProof) => {
  const gameData = {
    gameType,
    gameResult,
    playerAddress,
    betAmount,
    payout,
    entropyProof,
    timestamp: Date.now()
  };

  // Paralel olarak tüm blockchain'lere logla
  const [pushResult, solanaResult, lineraResult] = await Promise.allSettled([
    // Push Chain'e logla
    fetch('/api/log-to-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData),
    }).then(res => res.json()).catch(err => ({ success: false, error: err.message })),
    
    // Solana'ya logla
    fetch('/api/log-to-solana', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData),
    }).then(res => res.json()).catch(err => ({ success: false, error: err.message })),
    
    // Linera'ya logla
    logGameResultToLinera(gameData)
  ]);

  const pushChainResult = pushResult.status === 'fulfilled' ? pushResult.value : { success: false, error: pushResult.reason };
  const solanaLogResult = solanaResult.status === 'fulfilled' ? solanaResult.value : { success: false, error: solanaResult.reason };
  const lineraLogResult = lineraResult.status === 'fulfilled' ? lineraResult.value : { success: false, error: lineraResult.reason };

  return {
    entropyProof,
    pushChainResult: pushChainResult,
    solanaResult: solanaLogResult,
    lineraResult: lineraLogResult,
    // Oyun history'si için birleştirilmiş data
    combinedResult: {
      ...gameResult,
      entropyProof,
      // Push Chain
      pushChainTxHash: pushChainResult.success ? pushChainResult.transactionHash : null,
      pushChainExplorerUrl: pushChainResult.success ? pushChainResult.pushChainExplorerUrl : null,
      // Solana
      solanaTxSignature: solanaLogResult.success ? solanaLogResult.transactionSignature : null,
      solanaExplorerUrl: solanaLogResult.success ? solanaLogResult.solanaExplorerUrl : null,
      // Linera
      lineraChainId: lineraLogResult.success ? lineraLogResult.chainId : null,
      lineraBlockHeight: lineraLogResult.success ? lineraLogResult.blockHeight : null,
      lineraExplorerUrl: lineraLogResult.success ? lineraLogResult.lineraExplorerUrl : null,
      timestamp: gameData.timestamp
    }
  };
};

export default {
  logGameResultToLinera,
  logCompleteGameResultWithLinera
};