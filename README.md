# OmniYield - Cross-Chain Yield Farming Aggregator

⚡ **Powered by ZetaChain** - A comprehensive DeFi platform for cross-chain yield farming optimization.

## 🌟 Features

- **Cross-Chain Yield Farming**: Aggregate yield opportunities across multiple blockchains
- **ZetaChain Integration**: Native support for ZetaChain with real-time data
- **Real-Time Analytics**: Live portfolio tracking and performance metrics
- **Arbitrage Detection**: Automated cross-chain arbitrage opportunity discovery
- **AI-Powered Optimization**: Smart strategy recommendations for maximum yield
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Multi-Chain Support**: Ethereum, BSC, Polygon, Avalanche, Arbitrum, and ZetaChain

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **Framework**: FastAPI with async/await support
- **Database**: MongoDB with Motor (async driver)
- **Blockchain**: Web3.py integration with ZetaChain
- **APIs**: Real-time data from DeFiLlama, CoinGecko, and ZetaChain

### Frontend (React)
- **Framework**: React 19 with modern hooks
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: React hooks with real-time updates
- **Wallet Integration**: MetaMask and Web3 wallet support

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **MongoDB** (optional - app works without it)
- **MetaMask** or compatible Web3 wallet

### Option 1: Automated Setup (Recommended)

```bash
# Clone and navigate to the project
cd zetachain-project

# Start everything with one command
./start_all.sh
```

This will:
- Set up virtual environments
- Install all dependencies
- Start backend server (port 8000)
- Start frontend server (port 3000)
- Open the application in your browser

### Option 2: Manual Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp ../config.env .env

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
REACT_APP_ZETACHAIN_CHAIN_ID=7001
REACT_APP_ZETACHAIN_EXPLORER_URL=https://explorer.zetachain.com
EOF

# Start the development server
npm start
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ZetaChain Explorer**: https://explorer.zetachain.com

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

#### Backend (.env)
```env
# ZetaChain Configuration
ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
ZETACHAIN_CHAIN_ID=7001
ZETACHAIN_EXPLORER_URL=https://explorer.zetachain.com

# Database Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=omniyield

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### Frontend (.env.local)
```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
REACT_APP_ZETACHAIN_CHAIN_ID=7001
REACT_APP_ZETACHAIN_EXPLORER_URL=https://explorer.zetachain.com
```

## 📊 API Endpoints

### Core Endpoints
- `GET /api/` - API status and health check
- `GET /api/chains` - Supported blockchain networks
- `GET /api/protocols` - DeFi protocols and their data
- `GET /api/pools` - Yield farming pools with filtering
- `GET /api/portfolio` - User portfolio data
- `GET /api/arbitrage` - Cross-chain arbitrage opportunities

### ZetaChain Specific
- `GET /api/zetachain/status` - ZetaChain network status
- `GET /api/zetachain/balance/{address}` - ZETA balance for address

### Analytics
- `GET /api/analytics/overview` - Portfolio analytics summary
- `GET /api/analytics/yield-history` - Historical yield data
- `POST /api/strategy/optimize` - AI strategy optimization

## 🔗 Supported Networks

| Network | Chain ID | Native Token | Status |
|---------|----------|--------------|--------|
| ZetaChain | 7001 | ZETA | ✅ Primary |
| Ethereum | 1 | ETH | ✅ Supported |
| BSC | 56 | BNB | ✅ Supported |
| Polygon | 137 | MATIC | ✅ Supported |
| Avalanche | 43114 | AVAX | ✅ Supported |
| Arbitrum | 42161 | ETH | ✅ Supported |

## 🛠️ Development

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload --log-level debug
```

### Frontend Development

```bash
cd frontend
npm start
```

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes using ports 3000 and 8000
   lsof -ti:3000 | xargs kill -9
   lsof -ti:8000 | xargs kill -9
   ```

2. **MongoDB Connection Issues**
   - The app works without MongoDB (uses in-memory storage)
   - To use MongoDB: `brew install mongodb-community` (macOS) or `sudo apt install mongodb` (Ubuntu)

3. **ZetaChain Connection Issues**
   - Check internet connection
   - Verify ZetaChain RPC URL is accessible
   - Check if ZetaChain testnet is operational

4. **Wallet Connection Issues**
   - Ensure MetaMask is installed and unlocked
   - Check if you're on the correct network
   - Try refreshing the page

### Logs

- **Backend logs**: Check terminal where backend is running
- **Frontend logs**: Check browser console (F12)
- **MongoDB logs**: `/tmp/mongod.log` (if using MongoDB)

## 📈 Features in Detail

### Yield Farming Aggregation
- Real-time APY tracking across protocols
- Risk assessment and impermanent loss analysis
- Auto-compound functionality
- Multi-chain pool discovery

### Portfolio Management
- Cross-chain position tracking
- Real-time value calculations
- Performance analytics
- Historical yield data

### Arbitrage Detection
- Cross-chain price monitoring
- Gas cost optimization
- Profit calculation with fees
- Real-time opportunity alerts

### AI Optimization
- Machine learning-based strategy recommendations
- Risk-adjusted return optimization
- Gas fee minimization
- Dynamic rebalancing suggestions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and API docs at `/docs`
- **Issues**: Create an issue on GitHub
- **Discord**: Join our community for support

---

**Built with ❤️ for the ZetaChain ecosystem**
