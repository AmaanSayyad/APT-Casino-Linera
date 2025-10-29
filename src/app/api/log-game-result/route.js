const { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  tupleCV
} = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');

export async function POST(request) {
  try {
    const { gameType, gameResult, entropyProof, userAddress, betAmount, winAmount } = await request.json();

    console.log('🎮 Logging game result to Stacks:', {
      gameType,
      userAddress,
      betAmount,
      winAmount,
      entropyRequestId: entropyProof?.requestId
    });

    // Get treasury private key
    const treasuryPrivateKey = process.env.CASINO_TREASURY_PRIVATE_KEY;
    if (!treasuryPrivateKey) {
      return Response.json({ error: 'Treasury not configured' }, { status: 500 });
    }

    // Use testnet
    const network = new StacksTestnet();

    // Create game result data
    const gameData = {
      gameType: stringAsciiCV(gameType),
      player: stringAsciiCV(userAddress),
      betAmount: uintCV(Math.floor(betAmount * 1000000)), // Convert to microSTX
      winAmount: uintCV(Math.floor(winAmount * 1000000)), // Convert to microSTX
      entropyRequestId: stringAsciiCV(entropyProof?.requestId || 'fallback'),
      timestamp: uintCV(Date.now()),
      result: stringAsciiCV(JSON.stringify(gameResult).slice(0, 100)) // Limit length
    };

    // Create contract call transaction (using a simple memo for now)
    const txOptions = {
      contractAddress: process.env.NEXT_PUBLIC_CASINO_TREASURY_ADDRESS,
      contractName: 'game-logger', // We'll create this contract later
      functionName: 'log-game-result',
      functionArgs: [tupleCV(gameData)],
      senderKey: treasuryPrivateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      memo: `${gameType}:${userAddress.slice(0, 8)}:${betAmount}STX`
    };

    // For now, just create a simple STX transaction with memo containing game data
    const { makeSTXTokenTransfer } = require('@stacks/transactions');
    
    const memoData = `GAME:${gameType}:${userAddress.slice(0, 8)}:BET${betAmount}:WIN${winAmount}:${entropyProof?.requestId?.slice(0, 8) || 'FALLBACK'}`;
    
    // Use a different address for logging (can't send to self)
    const logRecipient = userAddress && userAddress !== 'anonymous' 
      ? userAddress 
      : 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Fallback address
    
    const simpleTxOptions = {
      recipient: logRecipient,
      amount: 1, // 1 microSTX (minimal amount)
      senderKey: treasuryPrivateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      memo: memoData.slice(0, 34) // Stacks memo limit
    };

    console.log('📝 Creating game log transaction with memo:', memoData.slice(0, 34));

    const transaction = await makeSTXTokenTransfer(simpleTxOptions);
    const result = await broadcastTransaction(transaction, network);

    console.log('📡 Game log broadcast result:', result);

    // Check if transaction was rejected
    if (result.error) {
      console.error('❌ Game log transaction rejected:', result);
      throw new Error(`Game log transaction rejected: ${result.reason || result.error}`);
    }

    console.log('✅ Game result logged to Stacks:', result.txid);

    return Response.json({
      success: true,
      txId: result.txid,
      stacksExplorerUrl: `https://explorer.stacks.co/txid/${result.txid}?chain=testnet`,
      memo: memoData.slice(0, 34)
    });

  } catch (error) {
    console.error('❌ Game logging error:', error);
    return Response.json({ 
      error: 'Game logging failed', 
      details: error.message 
    }, { status: 500 });
  }
}