import { ethers } from 'ethers';

// Push Chain Donut Testnet Configuration
const PUSH_CHAIN_RPC = process.env.NEXT_PUBLIC_PUSH_CHAIN_RPC || 'https://evm.rpc-testnet-donut-node1.push.org/';
const PUSH_CHAIN_EXPLORER = process.env.NEXT_PUBLIC_PUSH_CHAIN_EXPLORER || 'https://donut.push.network';

export async function POST(request) {
  try {
    const body = await request.json();
    const { gameType, gameResult, playerAddress, betAmount, payout, entropyProof } = body;

    console.log('🎮 Logging game result to Push Chain:', {
      gameType,
      gameResult,
      playerAddress,
      betAmount,
      payout
    });

    // Create provider for Push Chain
    const provider = new ethers.JsonRpcProvider(PUSH_CHAIN_RPC);
    
    // Get private key for treasury wallet
    const privateKey = process.env.TREASURY_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('TREASURY_PRIVATE_KEY environment variable is required');
    }

    // Create wallet and signer
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💳 Wallet balance:', ethers.formatEther(balance), 'ETH');

    // Create a simple transaction to log the game result on-chain
    // We'll encode the game data in the transaction data field
    const gameData = {
      gameType,
      gameResult,
      playerAddress,
      betAmount: betAmount.toString(),
      payout: payout.toString(),
      timestamp: Date.now(),
      entropyTxHash: entropyProof?.transactionHash || null,
      entropySequence: entropyProof?.sequenceNumber || null
    };

    // Encode game data as hex string
    const gameDataString = JSON.stringify(gameData);
    const gameDataHex = ethers.hexlify(ethers.toUtf8Bytes(gameDataString));

    // Send transaction with game data
    const tx = await wallet.sendTransaction({
      to: wallet.address, // Send to self to create a log entry
      value: 0, // No value transfer
      data: gameDataHex,
      gasLimit: 100000
    });

    console.log('✅ Game result logged to Push Chain:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

    // Create Push Chain explorer URL
    const pushChainExplorerUrl = `${PUSH_CHAIN_EXPLORER}/tx/${tx.hash}`;

    return Response.json({
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      pushChainExplorerUrl,
      gameData
    });

  } catch (error) {
    console.error('❌ Error logging to Push Chain:', error);
    
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}