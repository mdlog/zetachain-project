#!/bin/bash

# OmniYield Complete Application Startup Script
echo "🚀 Starting OmniYield - Cross-Chain Yield Farming Aggregator"
echo "⚡ Powered by ZetaChain"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if ports are available
if check_port 8000; then
    echo "⚠️ Port 8000 is already in use. Please stop the service using this port."
    exit 1
fi

if check_port 3000; then
    echo "⚠️ Port 3000 is already in use. Please stop the service using this port."
    exit 1
fi

# Make scripts executable
chmod +x start_backend.sh
chmod +x start_frontend.sh

echo "🔧 Setting up environment..."

# Start backend in background
echo "📡 Starting backend server..."
./start_backend.sh &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Check if backend is running
if ! check_port 8000; then
    echo "❌ Backend failed to start. Please check the logs."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend is running on http://localhost:8000"

# Start frontend
echo "🎨 Starting frontend..."
./start_frontend.sh &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 15

# Check if frontend is running
if ! check_port 3000; then
    echo "❌ Frontend failed to start. Please check the logs."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend is running on http://localhost:3000"
echo ""
echo "🎉 OmniYield is now running!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "🔄 Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
