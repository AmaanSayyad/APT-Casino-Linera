import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Solana Testnet Configuration
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.testnet.solana.com';
const SOLANA_EXPLORER = process.env.NEXT_PUBLIC_SOLANA_EXPLORER || 'https://explorer.solana.com';

export async function POST(request) {
  try {
    const body = await request.json();
    const { gameType, gameResult, playerAddress, betAmount, payout, entropyProof } = body;

    console.log('🎮 Logging game result to Solana:', {
      gameType,
      gameResult,
      playerAddress,
      betAmount,
      payout
    });

    // Create connection to Solana
    const connection = new Connection(SOLANA_RPC, 'confirmed');
    
    // Get private key for treasury wallet
    const privateKeyArray = process.env.SOLANA_TREASURY_PRIVATE_KEY;
    if (!privateKeyArray) {
      throw new Error('SOLANA_TREASURY_PRIVATE_KEY environment variable is required');
    }

    // Create keypair from private key
    let secretKey;
    try {
      secretKey = Uint8Array.from(JSON.parse(privateKeyArray));
    } catch (error) {
      throw new Error('Invalid SOLANA_TREASURY_PRIVATE_KEY format. Should be a JSON array.');
    }
    
    const wallet = Keypair.fromSecretKey(secretKey);
    
    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('💳 Wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');

    // Create game data to store on-chain
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

    // Create a memo instruction with game data
    const gameDataString = JSON.stringify(gameData);
    const memoInstruction = {
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), // Memo program
      data: Buffer.from(gameDataString, 'utf8')
    };

    // Create transaction with memo
    const transaction = new Transaction().add({
      keys: memoInstruction.keys,
      programId: memoInstruction.programId,
      data: memoInstruction.data
    });

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    transaction.sign(wallet);
    const signature = await connection.sendRawTransaction(transaction.serialize());

    console.log('✅ Game result logged to Solana:', signature);

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    console.log('✅ Transaction confirmed in slot:', confirmation.context.slot);

    // Create Solana explorer URL
    const solanaExplorerUrl = `${SOLANA_EXPLORER}/tx/${signature}?cluster=testnet`;

    return Response.json({
      success: true,
      transactionSignature: signature,
      slot: confirmation.context.slot,
      solanaExplorerUrl,
      gameData
    });

  } catch (error) {
    console.error('❌ Error logging to Solana:', error);
    
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}