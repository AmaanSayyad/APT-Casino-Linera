const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
require('dotenv').config();

async function checkSolanaBalance() {
  try {
    // Solana testnet bağlantısı
    const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
    
    // Cüzdan adresini al
    const walletAddress = process.env.SOLANA_TREASURY_ADDRESS;
    if (!walletAddress) {
      console.error('❌ SOLANA_TREASURY_ADDRESS bulunamadı!');
      return;
    }
    
    console.log('🔍 Solana Testnet Cüzdan Durumu');
    console.log('📍 Adres:', walletAddress);
    console.log('🌐 Network: Testnet');
    console.log('');
    
    // Bakiye kontrolü
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    console.log('💰 Bakiye:', solBalance, 'SOL');
    console.log('💰 Lamports:', balance);
    
    if (solBalance === 0) {
      console.log('');
      console.log('⚠️  Cüzdan boş! Fundlamak için:');
      console.log('1. https://faucet.solana.com/ adresine git');
      console.log('2. Adres:', walletAddress);
      console.log('3. Network: Testnet seç');
      console.log('4. Request Airdrop butonuna tıkla');
      console.log('');
      console.log('💡 Alternatif olarak Solana CLI ile:');
      console.log(`solana airdrop 2 ${walletAddress} --url testnet`);
    } else {
      console.log('✅ Cüzdan hazır! Oyun logging işlemleri yapılabilir.');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

checkSolanaBalance();