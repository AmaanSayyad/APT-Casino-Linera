const fetch = require('node-fetch');
require('dotenv').config();

async function testSolanaLogging() {
  console.log('🧪 Solana Logging Test Başlatılıyor...');
  
  const testGameData = {
    gameType: 'TEST',
    gameResult: {
      outcome: 'win',
      multiplier: '2.5x',
      testData: true
    },
    playerAddress: 'test_player',
    betAmount: 0.01,
    payout: 0.025,
    entropyProof: {
      requestId: 'test_request_' + Date.now(),
      sequenceNumber: '12345',
      randomValue: Math.random(),
      transactionHash: '0xtest123',
      timestamp: Date.now()
    }
  };

  try {
    console.log('📤 Test verisi gönderiliyor...');
    
    const response = await fetch('http://localhost:3000/api/log-to-solana', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testGameData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Solana logging başarılı!');
      console.log('🔗 Transaction Signature:', result.transactionSignature);
      console.log('🌐 Explorer URL:', result.solanaExplorerUrl);
      console.log('📊 Slot:', result.slot);
    } else {
      console.log('❌ Solana logging başarısız:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Next.js development server çalışıyor mu? (npm run dev)');
    }
  }
}

console.log('🚀 Solana Logging Test');
console.log('📍 Cüzdan:', process.env.SOLANA_TREASURY_ADDRESS);
console.log('');

testSolanaLogging();