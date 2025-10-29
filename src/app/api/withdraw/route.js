const { 
  makeSTXTokenTransfer, 
  broadcastTransaction, 
  AnchorMode,
  PostConditionMode 
} = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');

export async function POST(request) {
  try {
    const { userAddress, amount } = await request.json();

    // Validate input
    if (!userAddress || !amount || amount <= 0) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Get treasury private key from environment
    const treasuryPrivateKey = process.env.CASINO_TREASURY_PRIVATE_KEY;
    if (!treasuryPrivateKey) {
      return Response.json({ error: 'Treasury not configured' }, { status: 500 });
    }

    // Always use testnet for now (even in production environment)
    const network = new StacksTestnet();
    console.log('🌐 Using network:', network.coreApiUrl);

    // Convert amount to microSTX
    const amountInMicroSTX = Math.floor(amount * 1000000);

    console.log('🏦 Processing withdrawal:', {
      userAddress,
      amount,
      amountInMicroSTX,
      network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
      treasuryHasKey: !!treasuryPrivateKey
    });

    // Create STX transfer transaction
    const txOptions = {
      recipient: userAddress,
      amount: amountInMicroSTX,
      senderKey: treasuryPrivateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      memo: 'Casino Withdrawal'
    };

    console.log('📝 Transaction options:', {
      recipient: userAddress,
      amount: amountInMicroSTX,
      memo: 'Casino Withdrawal',
      networkUrl: network.coreApiUrl
    });

    const transaction = await makeSTXTokenTransfer(txOptions);
    console.log('✅ Transaction created, broadcasting...');
    
    const result = await broadcastTransaction(transaction, network);
    console.log('📡 Broadcast result:', result);

    // Check if transaction was rejected
    if (result.error) {
      console.error('❌ Transaction rejected:', result);
      throw new Error(`Transaction rejected: ${result.reason || result.error}`);
    }

    console.log('✅ Withdrawal transaction broadcasted:', result.txid);

    return Response.json({
      success: true,
      txId: result.txid,
      amount: amount,
      userAddress: userAddress
    });

  } catch (error) {
    console.error('❌ Withdrawal API error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      reason: error.reason,
      stack: error.stack?.split('\n').slice(0, 5)
    });
    
    return Response.json({ 
      error: 'Withdrawal failed', 
      details: error.message,
      code: error.code,
      reason: error.reason
    }, { status: 500 });
  }
}