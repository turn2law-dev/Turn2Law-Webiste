#!/bin/bash

# Turn2Law Dashboard Productionization - Installation Script
# This script installs required dependencies and sets up the environment

echo "🚀 Turn2Law Dashboard Productionization Setup"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
  echo "❌ Error: frontend directory not found!"
  echo "   Please run this script from the Turn2law Website root directory"
  exit 1
fi

# Navigate to frontend directory
cd frontend

echo "📦 Installing Supabase client..."
npm install @supabase/supabase-js

echo ""
echo "📦 Installing additional dependencies (if needed)..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next Steps:"
echo "=============================================="
echo ""
echo "1. Run the database schema in Supabase:"
echo "   - Open Supabase Dashboard (https://supabase.com/dashboard)"
echo "   - Go to SQL Editor"
echo "   - Copy and paste contents of 'database_schema_additions.sql'"
echo "   - Execute the SQL"
echo ""
echo "2. Create .env.local file in frontend directory:"
echo "   cd frontend"
echo "   touch .env.local"
echo ""
echo "3. Add these environment variables to .env.local:"
echo "   NEXT_PUBLIC_SUPABASE_URL=https://vjfpqtyinumanvpgqlbj.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here"
echo "   RAZORPAY_KEY_ID=your-razorpay-key"
echo "   RAZORPAY_KEY_SECRET=your-razorpay-secret"
echo ""
echo "4. Review the implementation plan:"
echo "   - See DASHBOARD_PRODUCTION_PLAN.md for detailed roadmap"
echo ""
echo "5. Start the development server:"
echo "   npm run dev"
echo ""
echo "=============================================="
echo "✨ Setup complete! Ready for dashboard refactoring."
