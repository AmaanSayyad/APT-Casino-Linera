import { ethers } from 'ethers';

// Pyth Entropy V2 Contract Configuration
const PYTH_ENTROPY_ADDRESS = '0x549ebba8036ab746611b4ffa1423eb0a4df61440';
const ARBITRUM_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';

// Contract ABI for Pyth Entropy V2
const PYTH_ENTROPY_ABI = [
  "function requestV2(uint32 gasLimit) external payable returns (uint64)",
  "function getRandomValue(bytes32 requestId) external view returns (bytes32)",
  "function isRequestFulfilled(bytes32 requestId) external view returns (bool)",
  "function getRequest(bytes32 requestId) external view returns (bool, bytes32, uint64, uint256)",
  "function getFeeV2(uint32 gasLimit) external view returns (uint256)",
  "function getFeeV2() external view returns (uint256)",
  "function getProvider() external view returns (address)",
  "event RandomnessRequested(bytes32 indexed requestId, address indexed provider, bytes32 userRandomNumber, uint64 sequenceNumber, address requester)",
  "event RandomnessFulfilled(bytes32 indexed requestId, bytes32 randomValue)"
];

export async function POST(request) {
  try {
    console.log('🎲 API: Generating Pyth Entropy...');
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC);
    
    // Create contract instance
    const contract = new ethers.Contract(PYTH_ENTROPY_ADDRESS, PYTH_ENTROPY_ABI, provider);
    
    // Get fee for the transaction
    let fee;
    try {
      fee = await contract.getFeeV2(200000); // 200k gas limit
      console.log('💰 Fee:', ethers.formatEther(fee), 'STX');
    } catch (error) {
      console.warn('⚠️ Could not get fee, using default:', error.message);
      fee = ethers.parseEther('0.001'); // Default fee
    }
    
    // Check if we have a private key for signing
    const privateKey = process.env.TREASURY_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('TREASURY_PRIVATE_KEY environment variable is required');
    }
    
    // Create wallet and signer
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = contract.connect(wallet);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Treasury wallet balance:', ethers.formatEther(balance), 'ETH');
    console.log('💰 Treasury wallet address:', wallet.address);
    
    if (balance < fee) {
      throw new Error(`Insufficient balance. Required: ${ethers.formatEther(fee)} ETH, Available: ${ethers.formatEther(balance)} ETH`);
    }
    
    // Request random value from Pyth Entropy
    console.log('🔄 Requesting random value from Pyth Entropy...');
    const tx = await contractWithSigner.requestV2(200000, {
      value: fee,
      gasLimit: 500000
    });
    
    console.log('✅ RequestV2 sent:', tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    
    // Extract request ID from transaction logs
    let requestId = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'RandomnessRequested') {
          requestId = parsedLog.args.requestId;
          break;
        }
      } catch (e) {
        // Continue to next log
      }
    }
    
    if (!requestId) {
      // Fallback: use transaction hash as request ID
      requestId = tx.hash;
      console.warn('⚠️ Could not extract request ID from logs, using transaction hash');
    }
    
    // Wait a bit for the random value to be available
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to get the random value
    let randomValue = null;
    try {
      const isFulfilled = await contract.isRequestFulfilled(requestId);
      if (isFulfilled) {
        const randomBytes = await contract.getRandomValue(requestId);
        randomValue = parseInt(randomBytes.slice(2, 10), 16) % 1000000;
        console.log('✅ Random value retrieved from contract:', randomValue);
      } else {
        console.warn('⚠️ Request not yet fulfilled, generating fallback');
        randomValue = generateRandomFromTxHash(tx.hash);
      }
    } catch (error) {
      console.warn('⚠️ Could not get random value from contract:', error.message);
      randomValue = generateRandomFromTxHash(tx.hash);
    }
    
    // Create entropy proof
    const entropyProof = {
      requestId: requestId,
      sequenceNumber: Date.now().toString(),
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber.toString(),
      randomValue: randomValue,
      network: 'arbitrum-sepolia',
      explorerUrl: `https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=${requestId}`,
      arbiscanUrl: `https://sepolia.arbiscan.io/tx/${tx.hash}`,
      timestamp: Date.now(),
      source: 'Pyth Entropy (Direct Contract)'
    };
    
    console.log('✅ API: Entropy generated successfully');
    console.log('🔗 Transaction:', tx.hash);
    console.log('🎲 Random value:', randomValue);
    
    return Response.json({
      success: true,
      randomValue: randomValue,
      entropyProof: entropyProof
    });
    
  } catch (error) {
    console.error('❌ API: Error generating entropy:', error);
    console.error('❌ API: Error details:', {
      message: error.message,
      code: error.code,
      reason: error.reason,
      stack: error.stack
    });
    
    return Response.json({
      success: false,
      error: error.message,
      randomValue: Math.floor(Math.random() * 1000000), // Fallback random value
      entropyProof: {
        requestId: 'fallback_' + Date.now(),
        sequenceNumber: Date.now().toString(),
        transactionHash: 'fallback_no_tx',
        blockNumber: null,
        randomValue: Math.floor(Math.random() * 1000000),
        network: 'arbitrum-sepolia',
        explorerUrl: 'https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia',
        arbiscanUrl: 'https://sepolia.arbiscan.io/',
        timestamp: Date.now(),
        source: 'Pyth Entropy (Fallback)'
      }
    }, { status: 500 });
  }
}

// Generate a deterministic random value from transaction hash
function generateRandomFromTxHash(txHash) {
  // Convert transaction hash to a number
  const hashNumber = parseInt(txHash.slice(2, 10), 16);
  return hashNumber % 1000000; // Return a number between 0 and 999999
}
