@echo off
echo 🚀 Starting Linera Local Network in WSL...

REM Start linera-storage-server in background
echo 📦 Starting Linera Storage Server...
start /B wsl -d Ubuntu bash -c "cd /mnt/c/Users/enliven/Documents/GitHub/APT-Casino-Linera/linera-protocol && ./target/release/linera-storage-server --storage rocksdb:/tmp/linera-storage --port 9042 > storage.log 2>&1"

REM Wait for storage server to start
timeout /t 5 /nobreak >nul

REM Start linera net up
echo 🌐 Starting Linera Network...
wsl -d Ubuntu bash -c "cd /mnt/c/Users/enliven/Documents/GitHub/APT-Casino-Linera/linera-protocol && source ~/.cargo/env && export LINERA_TMP_DIR=/tmp/linera && export LINERA_WALLET=/tmp/linera/wallet.json && export LINERA_KEYSTORE=/tmp/linera/keystore.json && export LINERA_STORAGE='rocksdb:/tmp/linera/client.db' && mkdir -p /tmp/linera && ./target/release/linera net up --with-faucet --faucet-port 8080 --path /tmp/linera"

pause