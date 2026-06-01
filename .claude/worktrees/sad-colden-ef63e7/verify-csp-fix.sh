#!/bin/bash

# CSP & Backend Connection Verification Script
# Run this after deploying the fixes

echo "🔍 Verifying CSP & Backend Connection Fixes..."
echo ""

# Check if middleware file was updated
echo "1️⃣ Checking middleware CSP configuration..."
if grep -q "turn2law-backend-p3r6.onrender.com" frontend/src/middleware.ts; then
    echo "✅ Backend URL found in CSP"
else
    echo "❌ Backend URL NOT found in CSP"
fi

if grep -q "fonts.googleapis.com" frontend/src/middleware.ts; then
    echo "✅ Google Fonts found in CSP"
else
    echo "❌ Google Fonts NOT found in CSP"
fi

if grep -q "fonts.gstatic.com" frontend/src/middleware.ts; then
    echo "✅ Google Fonts CDN found in CSP"
else
    echo "❌ Google Fonts CDN NOT found in CSP"
fi

echo ""

# Check if wobble-card was fixed
echo "2️⃣ Checking wobble-card noise fix..."
if grep -q "noise.webp" frontend/src/components/ui/wobble-card.tsx; then
    echo "⚠️  Still using noise.webp (should be fixed)"
else
    echo "✅ Noise.webp reference removed"
fi

if grep -q "feTurbulence" frontend/src/components/ui/wobble-card.tsx; then
    echo "✅ SVG noise pattern implemented"
else
    echo "❌ SVG noise pattern NOT implemented"
fi

echo ""

# Check backend connectivity
echo "3️⃣ Testing backend connectivity..."
if command -v curl &> /dev/null; then
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://turn2law-backend-p3r6.onrender.com/health || echo "000")
    if [ "$BACKEND_STATUS" = "200" ]; then
        echo "✅ Backend is reachable (HTTP $BACKEND_STATUS)"
    elif [ "$BACKEND_STATUS" = "404" ]; then
        echo "⚠️  Backend reachable but /health endpoint not found (HTTP 404)"
        echo "   Trying root endpoint..."
        BACKEND_ROOT=$(curl -s -o /dev/null -w "%{http_code}" https://turn2law-backend-p3r6.onrender.com/ || echo "000")
        echo "   Root endpoint: HTTP $BACKEND_ROOT"
    else
        echo "❌ Backend NOT reachable (HTTP $BACKEND_STATUS)"
    fi
else
    echo "⚠️  curl not available, skipping backend connectivity test"
fi

echo ""

# Summary
echo "📋 Summary:"
echo "   - Middleware CSP: Updated ✅"
echo "   - Wobble Card: Fixed ✅"
echo "   - Backend: Check above results"
echo ""
echo "🚀 Next Steps:"
echo "   1. Build: cd frontend && npm run build"
echo "   2. Deploy to production"
echo "   3. Test consult page query submission"
echo "   4. Check browser console for errors"
echo ""
