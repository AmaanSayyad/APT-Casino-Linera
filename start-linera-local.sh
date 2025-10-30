#!/bin/bash

# Linera Local Test Network Starter
echo "🚀 Starting Linera Local Test Network..."

# Set environment variables
export LINERA_TMP_DIR=$(mktemp -d)
export LINERA_WALLET="$LINERA_TMP_DIR/wallet.json"
export LINERA_KEYSTORE="$LINERA_TMP_DIR/keystore.json"
export LINERA_STORAGE="rocksdb:$LINERA_TMP_DIR/client.db"

echo "📁 Temporary directory: $LINERA_TMP_DIR"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Pull Linera Docker image
echo "📦 Pulling Linera Docker image..."
docker pull us-docker.pkg.dev/linera-io-dev/linera-public-registry/linera:latest

# Create a simple local network using Docker
echo "🌐 Starting Linera local network..."

# Create network configuration
mkdir -p "$LINERA_TMP_DIR/config"

# Start Linera proxy with in-memory storage
docker run -d \
  --name linera-local-proxy \
  -p 8080:8080 \
  -p 19100:19100 \
  -v "$LINERA_TMP_DIR:/tmp/linera" \
  us-docker.pkg.dev/linera-io-dev/linera-public-registry/linera:latest \
  sh -c "
    cd /tmp/linera && \
    ./linera storage initialize --storage memory --genesis /tmp/linera/genesis.json || true && \
    ./linera-proxy --storage memory --port 8080 --internal-port 19100
  "

# Wait for proxy to start
echo "⏳ Waiting for Linera proxy to start..."
sleep 10

# Check if proxy is running
if docker ps | grep -q linera-local-proxy; then
    echo "✅ Linera local network is running!"
    echo "🌐 GraphQL endpoint: http://localhost:8080/graphql"
    echo "🔍 Explorer: http://localhost:8080/explorer"
    echo "💧 Faucet: http://localhost:8080/faucet"
    echo ""
    echo "📝 Environment variables:"
    echo "export LINERA_TMP_DIR=$LINERA_TMP_DIR"
    echo "export LINERA_WALLET=$LINERA_WALLET"
    echo "export LINERA_KEYSTORE=$LINERA_KEYSTORE"
    echo "export LINERA_STORAGE=$LINERA_STORAGE"
    echo ""
    echo "🛑 To stop the network: docker stop linera-local-proxy && docker rm linera-local-proxy"
else
    echo "❌ Failed to start Linera local network"
    docker logs linera-local-proxy
    exit 1
fi