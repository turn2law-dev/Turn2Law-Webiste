#!/bin/bash

# 🔐 Password Reset Security Verification Script
# This script verifies that the bulletproof token leak fix is properly implemented

echo "🔐 Turn2Law Password Reset Security Verification"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
PASSED=0
FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1 exists"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1 missing"
        ((FAILED++))
    fi
}

# Function to check pattern in file
check_pattern() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC}: $3"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $3"
        ((FAILED++))
    fi
}

# Function to check pattern NOT in file
check_not_pattern() {
    if ! grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC}: $3"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $3"
        ((FAILED++))
    fi
}

echo "📁 Checking Required Files..."
echo "----------------------------"
check_file "frontend/src/app/api/auth/callback/route.ts"
check_file "frontend/src/middleware.ts"
check_file "frontend/src/app/reset-password/page.tsx"
check_file "frontend/src/lib/supabase-auth.ts"
echo ""

echo "🔒 Checking Server-Side Token Exchange..."
echo "---------------------------------------"
check_pattern "frontend/src/app/api/auth/callback/route.ts" "exchangeCodeForSession" "PKCE flow implemented"
check_pattern "frontend/src/app/api/auth/callback/route.ts" "httpOnly: true" "HTTP-only cookies set"
check_pattern "frontend/src/app/api/auth/callback/route.ts" "secure:" "Secure cookies configured"
echo ""

echo "🛡️ Checking Security Middleware..."
echo "--------------------------------"
check_pattern "frontend/src/middleware.ts" "access_token" "Middleware checks for access tokens"
check_pattern "frontend/src/middleware.ts" "refresh_token" "Middleware checks for refresh tokens"
check_pattern "frontend/src/middleware.ts" "X-Frame-Options" "Security headers configured"
echo ""

echo "🧹 Checking URL Sanitization..."
echo "-----------------------------"
check_pattern "frontend/src/app/reset-password/page.tsx" "window.history.replaceState" "URL clearing implemented"
check_pattern "frontend/src/app/reset-password/page.tsx" "urlClearedRef" "Race condition protection"
check_pattern "frontend/src/app/reset-password/page.tsx" "tokenProcessedRef" "Token processing protection"
echo ""

echo "🔐 Checking Secure Redirect..."
echo "----------------------------"
check_pattern "frontend/src/lib/supabase-auth.ts" "/api/auth/callback" "Secure server callback URL"
check_not_pattern "frontend/src/lib/supabase-auth.ts" "resetPasswordForEmail.*#access_token" "No direct token URL"
echo ""

echo "🚫 Checking for Insecure Patterns..."
echo "----------------------------------"
# Check that reset password page doesn't manually parse tokens
if grep -q "setSession.*access_token" "frontend/src/app/reset-password/page.tsx" 2>/dev/null; then
    echo -e "${RED}❌ FAIL${NC}: Client-side token handling found (INSECURE)"
    ((FAILED++))
else
    echo -e "${GREEN}✅ PASS${NC}: No client-side token handling"
    ((PASSED++))
fi

# Check that tokens aren't stored in localStorage
if grep -q "localStorage.*token" "frontend/src/app/reset-password/page.tsx" 2>/dev/null; then
    echo -e "${RED}❌ FAIL${NC}: localStorage token storage found (INSECURE)"
    ((FAILED++))
else
    echo -e "${GREEN}✅ PASS${NC}: No localStorage token storage"
    ((PASSED++))
fi
echo ""

echo "📊 Summary"
echo "=========="
echo -e "Total Checks: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All security checks passed!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Update Supabase email template to use /api/auth/callback"
    echo "2. Deploy all changes to production"
    echo "3. Test with real password reset flow"
    echo "4. Monitor logs for any token leak warnings"
    exit 0
else
    echo -e "${RED}⚠️  Some security checks failed!${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    exit 1
fi
