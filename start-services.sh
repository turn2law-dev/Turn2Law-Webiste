#!/bin/bash

# Turn2Law - Start All Services
# This script starts both the backend ML service and frontend Next.js app

echo "🚀 Starting Turn2Law Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Kill any existing processes
echo "${YELLOW}Stopping existing services...${NC}"
pkill -9 -f "main.py" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
sleep 2

# Start Backend
echo ""
echo "${YELLOW}Starting Backend ML Service (Port 8000)...${NC}"
cd "$SCRIPT_DIR/backend/ml-service"
python3 main.py > /tmp/turn2law-backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check backend health
BACKEND_STATUS=$(curl -s http://localhost:8000/health 2>/dev/null | grep -o "healthy" || echo "failed")

if [ "$BACKEND_STATUS" = "healthy" ]; then
    echo "${GREEN}✓ Backend started successfully (PID: $BACKEND_PID)${NC}"
    echo "  URL: http://localhost:8000"
    echo "  Logs: /tmp/turn2law-backend.log"
else
    echo "❌ Backend failed to start. Check /tmp/turn2law-backend.log"
    exit 1
fi

# Start Frontend
echo ""
echo "${YELLOW}Starting Frontend Next.js App (Port 9002)...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev > /tmp/turn2law-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 8

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9002 2>/dev/null)

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "${GREEN}✓ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
    echo "  URL: http://localhost:9002"
    echo "  Logs: /tmp/turn2law-frontend.log"
else
    echo "❌ Frontend failed to start. Check /tmp/turn2law-frontend.log"
    exit 1
fi

# Success message
echo ""
echo "${GREEN}════════════════════════════════════════════════════════${NC}"
echo "${GREEN}  ✅ Turn2Law Services Started Successfully!${NC}"
echo "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo "📱 Frontend:  http://localhost:9002"
echo "🤖 Backend:   http://localhost:8000"
echo "📄 Health:    http://localhost:8000/health"
echo ""
echo "🔧 View Logs:"
echo "   Backend:  tail -f /tmp/turn2law-backend.log"
echo "   Frontend: tail -f /tmp/turn2law-frontend.log"
echo ""
echo "🛑 Stop Services:"
echo "   pkill -9 -f 'main.py'"
echo "   pkill -9 -f 'next-server'"
echo ""
echo "🎯 Open Consult Page: http://localhost:9002/consult"
echo ""

# Open browser (optional)
if command -v open &> /dev/null; then
    sleep 2
    echo "🌐 Opening browser..."
    open http://localhost:9002/consult
fi
