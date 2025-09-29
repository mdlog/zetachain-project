#!/bin/bash

# OmniYield Frontend Startup Script
echo "🚀 Starting OmniYield Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️ Creating environment file..."
    cat > .env.local << EOF
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
REACT_APP_ZETACHAIN_CHAIN_ID=7001
REACT_APP_ZETACHAIN_EXPLORER_URL=https://explorer.zetachain.com
EOF
    echo "✅ Environment file created."
fi

# Start the development server
echo "🌟 Starting React development server..."
echo "📍 Frontend will be available at: http://localhost:3000"
echo "🔄 Press Ctrl+C to stop the server"
echo ""

npm start
