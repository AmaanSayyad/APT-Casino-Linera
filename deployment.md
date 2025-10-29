# 🚀 Stacks Casino Deployment Guide

## 📋 Prerequisites

### Development Environment
- Node.js 18+
- npm or yarn
- Git

### Wallets Required
- **Leather Wallet** (Stacks Network)
- **MetaMask** (Arbitrum Sepolia for Pyth Entropy)

### Network Access
- **Stacks Testnet** for development
- **Stacks Mainnet** for production
- **Arbitrum Sepolia** for Pyth Entropy (testnet)
- **Arbitrum One** for Pyth Entropy (mainnet)

## 🔧 Environment Configuration

### 1. Treasury Wallet Setup

#### Stacks Treasury
```bash
# Generate new Stacks wallet or use existing
# Testnet Address: STZ2YCW72SDSCVYQKEPC3PNQ7J69EFTFERHEPC9
# Mainnet Address: SPZ2YCW72SDSCVYQKEPC3PNQ7J69EFTFCZCDDME
```

#### Ethereum Treasury (for Pyth Entropy)
```bash
# Address: 0xb424d2369F07b925D1218B08e56700AF5928287b
# Fund with ETH for gas fees on Arbitrum
```

### 2. Environment Variables

#### Development (.env.local)
```env
# Stacks Network Configuration
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.stacks.co
NEXT_PUBLIC_STACKS_EXPLORER=https://explorer.stacks.co

# Stacks Treasury Configuration
CASINO_TREASURY_PRIVATE_KEY=fb4a3ce058c6a421976ba68d03a0b20e991ef6d384e5f99f1b371966e41bdbba
CASINO_TREASURY_ADDRESS_TESTNET=STZ2YCW72SDSCVYQKEPC3PNQ7J69EFTFERHEPC9
CASINO_TREASURY_ADDRESS_MAINNET=SPZ2YCW72SDSCVYQKEPC3PNQ7J69EFTFCZCDDME
NEXT_PUBLIC_CASINO_TREASURY_ADDRESS=STZ2YCW72SDSCVYQKEPC3PNQ7J69EFTFERHEPC9

# Pyth Entropy Configuration (Arbitrum Sepolia)
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_ARBITRUM_SEPOLIA_CHAIN_ID=421614
NEXT_PUBLIC_ARBITRUM_SEPOLIA_EXPLORER=https://sepolia.arbiscan.io
TREASURY_PRIVATE_KEY=0x080c0b0dc7aa27545fab73d29b06f33e686d1491aef785bf5ced325a32c14506

# Casino Configuration
STACKS_MIN_DEPOSIT=1
STACKS_MAX_DEPOSIT=1000
STACKS_MIN_WITHDRAW=0.1
STACKS_DEPOSIT_FEE=0.01
STACKS_WITHDRAW_FEE=0.01

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true
```

#### Production (.env.production)
```env
# Stacks Network Configuration
NEXT_PUBLIC_STACKS_NETWORK=mainnet
NEXT_PUBLIC_STACKS_API_URL=https://api.stacks.co
NEXT_PUBLIC_STACKS_EXPLORER=https://explorer.stacks.co

# Stacks Treasury Configuration (Use secure key management)
CASINO_TREASURY_PRIVATE_KEY=your_secure_mainnet_private_key
CASINO_TREASURY_ADDRESS_MAINNET=your_mainnet_treasury_address
NEXT_PUBLIC_CASINO_TREASURY_ADDRESS=your_mainnet_treasury_address

# Pyth Entropy Configuration (Arbitrum One)
NEXT_PUBLIC_ARBITRUM_ONE_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_ARBITRUM_ONE_CHAIN_ID=42161
NEXT_PUBLIC_ARBITRUM_ONE_EXPLORER=https://arbiscan.io
TREASURY_PRIVATE_KEY=your_secure_ethereum_private_key

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false
```

## 🏗️ Build Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Application
```bash
npm run build
```

### 3. Test Build Locally
```bash
npm start
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all production environment variables
5. Redeploy

#### Custom Domain
```bash
# Add custom domain
vercel domains add yourdomain.com
```

### Option 2: Netlify

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=.next
```

#### Build Settings
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

### Option 3: Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  stacks-casino:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
```

## 🔐 Security Checklist

### Pre-Deployment Security

#### 1. Private Key Management
- [ ] Private keys stored in secure environment variables
- [ ] No private keys in source code
- [ ] Use different keys for testnet/mainnet
- [ ] Backup private keys securely

#### 2. Environment Variables
- [ ] All sensitive data in environment variables
- [ ] No hardcoded secrets
- [ ] Separate configs for dev/prod
- [ ] Verify all required variables set

#### 3. Network Configuration
- [ ] Correct RPC endpoints
- [ ] Proper chain IDs
- [ ] Valid contract addresses
- [ ] Network-specific configurations

### Post-Deployment Security

#### 1. Treasury Monitoring
- [ ] Monitor STX treasury balance
- [ ] Monitor ETH treasury balance (for gas)
- [ ] Set up balance alerts
- [ ] Regular security audits

#### 2. Transaction Monitoring
- [ ] Monitor deposit transactions
- [ ] Monitor withdrawal transactions
- [ ] Track failed transactions
- [ ] Set up anomaly detection

## 💰 Treasury Management

### Funding Requirements

#### Stacks Treasury
```bash
# Testnet: Fund with testnet STX
# Mainnet: Fund with real STX for withdrawals
# Minimum recommended: 1000 STX
```

#### Ethereum Treasury
```bash
# Arbitrum Sepolia: ~0.1 ETH for testing
# Arbitrum One: ~1 ETH for production
# Used for Pyth Entropy gas fees
```

### Balance Monitoring
```javascript
// Example monitoring script
const checkBalances = async () => {
  // Check STX balance
  const stxBalance = await getStacksBalance(treasuryAddress);
  
  // Check ETH balance
  const ethBalance = await getEthBalance(ethTreasuryAddress);
  
  // Alert if low
  if (stxBalance < 100) {
    sendAlert('Low STX balance');
  }
  
  if (ethBalance < 0.1) {
    sendAlert('Low ETH balance');
  }
};
```

## 📊 Monitoring & Analytics

### Application Monitoring
- **Vercel Analytics** - Built-in performance monitoring
- **Sentry** - Error tracking and performance
- **LogRocket** - User session recording

### Blockchain Monitoring
- **Stacks Explorer** - Transaction monitoring
- **Arbiscan** - Ethereum transaction monitoring
- **Custom Dashboards** - Treasury balance tracking

### Performance Monitoring
```javascript
// Example performance tracking
const trackGamePerformance = (gameType, duration, outcome) => {
  analytics.track('Game Played', {
    game: gameType,
    duration: duration,
    outcome: outcome,
    timestamp: Date.now()
  });
};
```

## 🚨 Incident Response

### Common Issues

#### 1. Treasury Balance Low
```bash
# Immediate action
1. Fund treasury wallet
2. Notify users of temporary service interruption
3. Resume operations

# Prevention
- Set up automated alerts
- Maintain minimum balance thresholds
```

#### 2. RPC Endpoint Down
```bash
# Immediate action
1. Switch to backup RPC
2. Update environment variables
3. Redeploy if necessary

# Prevention
- Configure multiple RPC endpoints
- Implement automatic failover
```

#### 3. High Gas Fees
```bash
# Immediate action
1. Monitor gas prices
2. Adjust transaction timing
3. Consider L2 alternatives

# Prevention
- Implement gas price monitoring
- Use gas optimization strategies
```

## 📈 Scaling Considerations

### Performance Optimization
- **CDN** - Static asset delivery
- **Caching** - Redis for session data
- **Database** - PostgreSQL for user data
- **Load Balancing** - Multiple server instances

### Cost Optimization
- **Efficient RPC Usage** - Batch requests
- **Gas Optimization** - Smart contract efficiency
- **Resource Management** - Proper caching strategies

## 🔄 Continuous Deployment

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Treasury wallets funded
- [ ] Security audit completed
- [ ] Performance testing done

### Deployment
- [ ] Build successful
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CDN configured

### Post-Deployment
- [ ] Application accessible
- [ ] Wallet connections working
- [ ] Deposits/withdrawals functional
- [ ] Games operational
- [ ] Monitoring active
- [ ] Alerts configured

## 🆘 Support & Maintenance

### Regular Maintenance
- **Weekly**: Check treasury balances
- **Monthly**: Security audit
- **Quarterly**: Performance review
- **Annually**: Full security assessment

### Emergency Contacts
- **Technical Lead**: technical@stackscasino.com
- **Security Team**: security@stackscasino.com
- **Operations**: ops@stackscasino.com

---

## 📚 Additional Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Pyth Network Documentation](https://docs.pyth.network/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Deployment completed successfully! 🚀**

*Remember to monitor your application and treasury balances regularly.*