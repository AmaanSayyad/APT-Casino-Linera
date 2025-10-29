/**
 * Linera Blockchain Logger API Route
 * Oyun sonuçlarını gerçek Linera blockchain'e loglar
 */

import { NextResponse } from 'next/server';
import { LINERA_CONFIG } from '../../../config/lineraConfig';
import { lineraGameLogger } from '../../../services/LineraGameLoggerService';

export async function POST(request) {
  try {
    const gameData = await request.json();
    
    // Validate game data
    if (!LINERA_CONFIG.validateGameData(gameData)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid game data structure' 
      }, { status: 400 });
    }

    console.log('🎮 Processing Linera game log:', {
      gameType: gameData.gameType,
      playerAddress: gameData.playerAddress,
      betAmount: gameData.betAmount,
      payout: gameData.payout
    });

    // Initialize service if not already done
    if (!lineraGameLogger.isReady()) {
      console.log('🔄 Initializing Linera Game Logger Service...');
      await lineraGameLogger.initialize();
    }

    // Log game result to Linera blockchain
    const result = await lineraGameLogger.logGameResult(gameData);

    if (result.success) {
      console.log('✅ Game result logged to Linera successfully:', {
        chainId: result.chainId,
        blockHeight: result.blockHeight,
        messageId: result.messageId
      });
      
      return NextResponse.json({
        success: true,
        chainId: result.chainId,
        blockHeight: result.blockHeight,
        messageId: result.messageId,
        lineraExplorerUrl: result.lineraExplorerUrl,
        timestamp: result.timestamp,
        gameData: LINERA_CONFIG.formatGameDataForLinera(gameData)
      });
    } else {
      console.error('❌ Failed to log to Linera:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Linera logging error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Linera Game Logger API',
    status: 'active',
    endpoints: {
      POST: '/api/log-to-linera - Log game results to Linera blockchain'
    }
  });
}