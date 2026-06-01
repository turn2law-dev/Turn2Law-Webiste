#!/bin/bash

# Restart Backend Server Script
# This script stops any running backend process and starts a fresh one

echo "🔄 Restarting Turn2Law Backend Server..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Kill any existing backend process
echo "🛑 Stopping existing backend process..."
pkill -f "node.*dist/index.js" 2>/dev/null || echo "   No existing process found"
sleep 1

# Start the backend
echo "🚀 Starting backend server..."
npm run dev

echo "✅ Backend server restarted!"
echo "📡 Server should be running on http://localhost:3001"
