#!/bin/bash

# Turn2Law ML Service Startup Script
echo "🚀 Starting Turn2Law ML Matchmaking Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Start the service
echo "✅ Starting FastAPI server..."
echo "🌐 API will be available at: http://localhost:8000"
echo "📚 API docs available at: http://localhost:8000/docs"
echo ""
python3 main.py
