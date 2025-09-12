#!/bin/bash

# Start script for Pen2PDF CommonJS Application
# This script starts both backend and frontend servers

echo "🚀 Starting Pen2PDF CommonJS Application..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend-commonjs" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Expected directories: backend/ and frontend-commonjs/"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend server
echo "📡 Starting backend server (port 8000)..."
cd backend
npm install > /dev/null 2>&1
node index.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🌐 Starting frontend server (port 3000)..."
cd frontend-commonjs
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started successfully!"
echo ""
echo "🔗 Application URLs:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:8000/api/gemini"
echo "   Health Check: http://localhost:8000/health"
echo ""
echo "📖 Usage:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Upload an image file"
echo "   3. Click 'Extract Text & Generate PDF'"
echo "   4. PDF will download automatically"
echo ""
echo "⚠️  Note: Using mock responses (set GEMINI_APIKEY in backend/.env for real AI)"
echo ""
echo "Press Ctrl+C to stop servers..."

# Wait for processes
wait