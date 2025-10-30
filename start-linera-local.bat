@echo off
REM Linera Local Test Network Starter for Windows

echo 🚀 Starting Linera Local Test Network...

REM Set environment variables
set LINERA_TMP_DIR=%TEMP%\linera-%RANDOM%
set LINERA_WALLET=%LINERA_TMP_DIR%\wallet.json
set LINERA_KEYSTORE=%LINERA_TMP_DIR%\keystore.json
set LINERA_STORAGE=rocksdb:%LINERA_TMP_DIR%\client.db

echo 📁 Temporary directory: %LINERA_TMP_DIR%

REM Create temporary directory
mkdir "%LINERA_TMP_DIR%" 2>nul

REM Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Pull Linera Docker image
echo 📦 Pulling Linera Docker image...
docker pull us-docker.pkg.dev/linera-io-dev/linera-public-registry/linera:latest

REM Stop any existing container
docker stop linera-local-proxy >nul 2>&1
docker rm linera-local-proxy >nul 2>&1

REM Start Linera proxy with in-memory storage
echo 🌐 Starting Linera local network...
docker run -d ^
  --name linera-local-proxy ^
  -p 8080:8080 ^
  -p 19100:19100 ^
  us-docker.pkg.dev/linera-io-dev/linera-public-registry/linera:latest ^
  sh -c "mkdir -p /tmp/linera && cd /tmp/linera && /linera-proxy --storage memory --port 8080"

REM Wait for proxy to start
echo ⏳ Waiting for Linera proxy to start...
timeout /t 15 /nobreak >nul

REM Check if proxy is running
docker ps | findstr linera-local-proxy >nul
if errorlevel 1 (
    echo ❌ Failed to start Linera local network
    docker logs linera-local-proxy
    exit /b 1
) else (
    echo ✅ Linera local network is running!
    echo 🌐 GraphQL endpoint: http://localhost:8080/graphql
    echo 🔍 Explorer: http://localhost:8080/explorer
    echo 💧 Faucet: http://localhost:8080/faucet
    echo.
    echo 📝 Environment variables:
    echo set LINERA_TMP_DIR=%LINERA_TMP_DIR%
    echo set LINERA_WALLET=%LINERA_WALLET%
    echo set LINERA_KEYSTORE=%LINERA_KEYSTORE%
    echo set LINERA_STORAGE=%LINERA_STORAGE%
    echo.
    echo 🛑 To stop the network: docker stop linera-local-proxy ^&^& docker rm linera-local-proxy
)

pause