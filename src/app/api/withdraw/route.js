import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Push Chain Treasury private key from environment
const PUSH_CHAIN_TREASURY_PRIVATE_KEY = process.env.PUSH_CHAIN_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY || "0x080c0b0dc7aa27545fab73d29b06f33e686d1491aef785bf5ced325a32c14506";

// Push Chain Donut Testnet RPC URL
const PUSH_CHAIN_RPC = process.env.NEXT_PUBLIC_PUSH_CHAIN_RPC || 'https://evm.rpc-testnet-donut-node1.push.org/';

// Create provider and wallet
const provider = new ethers.JsonRpcProvider(PUSH_CHAIN_RPC);
const treasuryWallet = new ethers.Wallet(PUSH_CHAIN_TREASURY_PRIVATE_KEY, provider);

export async function POST(request) {
  try {
    const { userAddress, amount } = await request.json();

    console.log('📥 Received withdrawal request:', { userAddress, amount, type: typeof userAddress });

    // Validate input
    if (!userAddress || !amount || amount <= 0) {
      return new Response(JSON.stringify({
        error: 'Invalid parameters'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!PUSH_CHAIN_TREASURY_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Treasury not configured' },
        { status: 500 }
      );
    }

    console.log(`🏦 Processing withdrawal: ${amount} PC to ${userAddress}`);
    console.log(`📍 Treasury: ${treasuryWallet.address}`);

    // Check treasury balance
    let treasuryBalance = 0;
    try {
      treasuryBalance = await provider.getBalance(treasuryWallet.address);
      console.log(`💰 Treasury balance: ${ethers.formatEther(treasuryBalance)} PC`);
    } catch (balanceError) {
      console.log('⚠️ Could not check treasury balance, proceeding with transfer attempt...');
      console.log('Balance error:', balanceError.message);
    }

    // Check if treasury has sufficient funds
    const amountWei = ethers.parseEther(amount.toString());
    if (treasuryBalance < amountWei) {
      return NextResponse.json(
        { error: `Insufficient treasury funds. Available: ${ethers.formatEther(treasuryBalance)} PC, Requested: ${amount} PC` },
        { status: 400 }
      );
    }

    // Format user address
    let formattedUserAddress;
    if (typeof userAddress === 'object' && userAddress.data) {
      // Convert Uint8Array-like object to hex string
      const bytes = Object.values(userAddress.data);
      formattedUserAddress = '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    } else if (typeof userAddress === 'string') {
      formattedUserAddress = userAddress.startsWith('0x') ? userAddress : `0x${userAddress}`;
    } else {
      throw new Error(`Invalid userAddress format: ${typeof userAddress}`);
    }

    console.log('🔧 Formatted user address:', formattedUserAddress);
    console.log('🔧 Treasury account:', treasuryWallet.address);
    console.log('🔧 Amount in Wei:', amountWei.toString());

    // Send transaction from treasury to user
    const tx = await treasuryWallet.sendTransaction({
      to: formattedUserAddress,
      value: amountWei,
      gasLimit: process.env.GAS_LIMIT_WITHDRAW ? parseInt(process.env.GAS_LIMIT_WITHDRAW) : 100000
    });

    console.log(`📤 Transaction sent: ${tx.hash}`);

    // Return transaction hash immediately without waiting for confirmation
    // User can check transaction status on Etherscan
    console.log(`✅ Withdraw PC to ${userAddress}, TX: ${tx.hash}`);

    return new Response(JSON.stringify({
      success: true,
      transactionHash: tx.hash,
      amount: amount,
      userAddress: userAddress,
      treasuryAddress: treasuryWallet.address,
      status: 'pending',
      message: 'Transaction sent successfully. Check Etherscan for confirmation.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Withdraw API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Ensure error message is a string
    const errorMessage = error?.message || 'Unknown error occurred';
    const safeErrorMessage = typeof errorMessage === 'string' ? errorMessage : 'Unknown error occurred';

    return new Response(JSON.stringify({
      error: `Withdrawal failed: ${safeErrorMessage}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// GET endpoint to check treasury balance
export async function GET() {
  try {
    if (!PUSH_CHAIN_TREASURY_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Treasury not configured' },
        { status: 500 }
      );
    }

    const treasuryAccount = new EthereumAccount(
      new Uint8Array(Buffer.from(PUSH_CHAIN_TREASURY_PRIVATE_KEY.slice(2), 'hex'))
    );

    const coinClient = new CoinClient(client);

    try {
      const balance = await coinClient.checkBalance(treasuryAccount);

      return NextResponse.json({
        treasuryAddress: treasuryAccount.address().hex(),
        balance: balance / 100000000, // Convert to PC balanceOctas: balance.toString(),
        status: 'active'
      });
    } catch (balanceError) {
      return NextResponse.json({
        treasuryAddress: treasuryAccount.address().hex(),
        balance: 0,
        balanceOctas: '0',
        status: 'initializing',
        note: 'Treasury wallet is being initialized. Please wait a few minutes.'
      });
    }

  } catch (error) {
    console.error('Treasury balance check error:', error);
    return NextResponse.json(
      { error: 'Failed to check treasury balance: ' + error.message },
      { status: 500 }
    );
  }
}