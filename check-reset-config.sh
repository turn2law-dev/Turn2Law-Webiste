#!/bin/bash

# 🔍 Turn2Law Password Reset URL Verification Script
# This script helps you verify that your password reset configuration is correct

echo "🔍 Turn2Law Password Reset Configuration Checker"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Environment Variables
echo "📋 Step 1: Checking Environment Variables..."
echo ""

if [ -f "frontend/.env.local" ]; then
    echo "✅ Found frontend/.env.local"
    
    SITE_URL=$(grep "NEXT_PUBLIC_SITE_URL" frontend/.env.local | cut -d '=' -f2)
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" frontend/.env.local | cut -d '=' -f2)
    
    echo "   NEXT_PUBLIC_SITE_URL: $SITE_URL"
    echo "   NEXT_PUBLIC_SUPABASE_URL: $SUPABASE_URL"
    
    if [[ "$SITE_URL" == *"localhost"* ]]; then
        echo -e "${RED}   ⚠️  WARNING: Site URL contains 'localhost' - should be production domain!${NC}"
    else
        echo -e "${GREEN}   ✅ Site URL looks good (not localhost)${NC}"
    fi
else
    echo -e "${RED}❌ frontend/.env.local not found!${NC}"
fi

echo ""

# Check 2: Code Configuration
echo "📋 Step 2: Checking Code Files..."
echo ""

if [ -f "frontend/src/lib/supabase-auth.ts" ]; then
    echo "✅ Found supabase-auth.ts"
    
    if grep -q "process.env.NEXT_PUBLIC_SITE_URL" frontend/src/lib/supabase-auth.ts; then
        echo -e "${GREEN}   ✅ Using NEXT_PUBLIC_SITE_URL environment variable${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Not using NEXT_PUBLIC_SITE_URL (may use window.location.origin)${NC}"
    fi
    
    if grep -q "/api/auth/callback" frontend/src/lib/supabase-auth.ts; then
        echo -e "${GREEN}   ✅ Using secure callback route${NC}"
    else
        echo -e "${RED}   ❌ NOT using secure callback route!${NC}"
    fi
else
    echo -e "${RED}❌ supabase-auth.ts not found!${NC}"
fi

echo ""

if [ -f "frontend/src/app/api/auth/callback/route.ts" ]; then
    echo -e "${GREEN}✅ Found callback route (api/auth/callback/route.ts)${NC}"
else
    echo -e "${RED}❌ Callback route NOT FOUND! (api/auth/callback/route.ts)${NC}"
fi

echo ""

if [ -f "frontend/src/middleware.ts" ]; then
    echo -e "${GREEN}✅ Found security middleware${NC}"
else
    echo -e "${YELLOW}⚠️  Security middleware not found (optional but recommended)${NC}"
fi

echo ""

# Check 3: Manual Configuration Checklist
echo "📋 Step 3: Manual Configuration Checklist"
echo ""
echo "Please verify these settings in Supabase Dashboard:"
echo ""
echo "1. Supabase Site URL:"
echo "   [ ] Go to: Settings -> Authentication"
echo "   [ ] Site URL should be: https://turn2law.com (NOT localhost)"
echo ""
echo "2. Redirect URLs:"
echo "   [ ] Should include: https://turn2law.com/api/auth/callback"
echo "   [ ] Should include: https://turn2law.com/reset-password"
echo ""
echo "3. Email Template:"
echo "   [ ] Go to: Authentication -> Email Templates"
echo "   [ ] Reset Password template should link to:"
echo "       {{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery"
echo "   [ ] NOT: {{ .ConfirmationURL }}"
echo ""

# Check 4: Testing Instructions
echo "📋 Step 4: Testing Instructions"
echo ""
echo "After configuring Supabase dashboard:"
echo ""
echo "1. Request a NEW password reset email"
echo "2. Check the email - link should be:"
echo "   https://turn2law.com/api/auth/callback?token_hash=XXX&type=recovery"
echo ""
echo "3. If link shows localhost:"
echo "   - Supabase Site URL is still set to localhost"
echo "   - Update it in Supabase dashboard"
echo "   - Request ANOTHER new reset email"
echo ""
echo "4. Click the link and verify:"
echo "   - URL should redirect to: https://turn2law.com/reset-password?verified=true"
echo "   - NO tokens should be visible in URL"
echo "   - Password reset form should appear"
echo ""

# Summary
echo "================================================"
echo "📊 Configuration Summary"
echo "================================================"
echo ""
echo "Code Changes:"
if [ -f "frontend/src/app/api/auth/callback/route.ts" ] && [ -f "frontend/src/lib/supabase-auth.ts" ]; then
    echo -e "${GREEN}✅ All required code files exist${NC}"
else
    echo -e "${RED}❌ Missing required code files${NC}"
fi

echo ""
echo "Next Steps:"
echo "1. Update Supabase Site URL (if showing localhost)"
echo "2. Update Supabase Email Template"
echo "3. Update Supabase Redirect URLs"
echo "4. Request NEW password reset email"
echo "5. Test the reset flow"
echo ""
echo "For detailed instructions, see:"
echo "  - docs/LOCALHOST_URL_FIX.md"
echo "  - docs/TOKEN_LEAK_FIX_BULLETPROOF.md"
echo ""
