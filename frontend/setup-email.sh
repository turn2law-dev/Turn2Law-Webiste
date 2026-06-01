#!/bin/bash

# Turn2Law Email Service Setup Script
# This script helps you set up email delivery for the contact form

echo "================================================"
echo "  Turn2Law - Email Service Setup"
echo "================================================"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    echo "   cd frontend"
    echo "   bash setup-email.sh"
    exit 1
fi

echo "📦 Step 1: Installing Resend package..."
npm install resend

if [ $? -eq 0 ]; then
    echo "✅ Resend package installed successfully!"
else
    echo "❌ Failed to install Resend package"
    exit 1
fi

echo ""
echo "================================================"
echo "  🎉 Package Installation Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Sign up for a free Resend account:"
echo "   👉 https://resend.com"
echo ""
echo "2. Get your API key from the Resend dashboard"
echo ""
echo "3. Create a .env.local file in this directory with:"
echo "   RESEND_API_KEY=re_your_actual_api_key_here"
echo ""
echo "4. Restart your development server:"
echo "   npm run dev"
echo ""
echo "5. Test the contact form at http://localhost:3000"
echo ""
echo "================================================"
echo "  For detailed instructions, see:"
echo "  docs/EMAIL_SETUP_GUIDE.md"
echo "================================================"
echo ""
