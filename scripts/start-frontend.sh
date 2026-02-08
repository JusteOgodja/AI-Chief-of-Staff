#!/bin/bash
# Script to start the AI Chief of Staff frontend

echo "🚀 Starting AI Chief of Staff Frontend..."

# Check if we're in the right directory
cd "$(dirname "$0")/frontend_modern" || exit 1

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting Vite development server on http://localhost:8080"
echo "⏹️  Press Ctrl+C to stop the server"
npm run dev
