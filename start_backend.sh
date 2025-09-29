#!/bin/bash

# OmniYield Backend Startup Script
echo "🚀 Starting OmniYield Backend Server..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating environment file..."
    cp ../config.env .env
    echo "✅ Environment file created. Please edit .env file with your configuration."
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️ MongoDB is not running. Starting MongoDB..."
        mongod --fork --logpath /tmp/mongod.log
    else
        echo "✅ MongoDB is running"
    fi
else
    echo "⚠️ MongoDB not found. The app will use in-memory storage."
fi

# Start the server
echo "🌟 Starting FastAPI server..."
echo "📍 Server will be available at: http://localhost:8000"
echo "📚 API documentation at: http://localhost:8000/docs"
echo "🔄 Press Ctrl+C to stop the server"
echo ""

uvicorn server:app --host 0.0.0.0 --port 8000 --reload
