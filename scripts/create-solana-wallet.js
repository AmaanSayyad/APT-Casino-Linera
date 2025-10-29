const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Yeni Solana keypair oluştur
const keypair = Keypair.generate();

console.log('🔑 Yeni Solana Cüzdanı Oluşturuldu!');
console.log('📍 Public Key (Address):', keypair.publicKey.toString());
console.log('🔐 Private Key Array:', JSON.stringify(Array.from(keypair.secretKey)));

// .env dosyasını güncelle
const envPath = path.join(__dirname, '..', '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Mevcut Solana private key'i değiştir
const newPrivateKeyLine = `SOLANA_TREASURY_PRIVATE_KEY=${JSON.stringify(Array.from(keypair.secretKey))}`;
const publicKeyLine = `SOLANA_TREASURY_ADDRESS=${keypair.publicKey.toString()}`;

// Mevcut satırları değiştir veya ekle
if (envContent.includes('SOLANA_TREASURY_PRIVATE_KEY=')) {
  envContent = envContent.replace(/SOLANA_TREASURY_PRIVATE_KEY=.*/, newPrivateKeyLine);
} else {
  envContent += '\n' + newPrivateKeyLine;
}

if (envContent.includes('SOLANA_TREASURY_ADDRESS=')) {
  envContent = envContent.replace(/SOLANA_TREASURY_ADDRESS=.*/, publicKeyLine);
} else {
  envContent += '\n' + publicKeyLine;
}

fs.writeFileSync(envPath, envContent);

console.log('✅ .env dosyası güncellendi!');
console.log('');
console.log('🚀 Cüzdanı Fundlamak İçin:');
console.log('1. Solana Testnet Faucet: https://faucet.solana.com/');
console.log('2. Adres:', keypair.publicKey.toString());
console.log('3. Network: Testnet');
console.log('');
console.log('💡 Alternatif olarak Solana CLI ile:');
console.log(`solana airdrop 2 ${keypair.publicKey.toString()} --url testnet`);