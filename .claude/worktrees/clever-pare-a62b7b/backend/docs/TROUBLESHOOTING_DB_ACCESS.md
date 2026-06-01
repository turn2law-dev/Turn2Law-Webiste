# 🔧 Backend Database Integration - Troubleshooting Guide

## Issue Status
❌ **"Invalid API key" error** when backend tries to access Supabase database tables

## Quick Diagnosis

Run this test:
```bash
curl http://localhost:3001/api/auth/test/db-check
```

Expected result:
```json
{
  "success": true,
  "results": {
    "usersTable": { "accessible": true },
    "walletBalancesTable": { "accessible": true }
  }
}
```

Current result:
```json
{
  "success": true,
  "results": {
    "usersTable": { "accessible": false, "error": "Invalid API key" },
    "walletBalancesTable": { "accessible": false, "error": "Invalid API key" }
  }
}
```

## Root Cause

The Supabase Service Role Key in your backend `.env` file is either:
1. ❌ Invalid/expired
2. ❌ Not from the correct Supabase project  
3. ❌ Not configured with proper permissions

## Solution Steps

### Step 1: Get Fresh Supabase Keys

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Login to your account

2. **Select Your Project:**
   - Project name: `vjfpqtyinumanvpgqlbj`
   - URL: https://vjfpqtyinumanvpgqlbj.supabase.co

3. **Get API Keys:**
   - Click on "Settings" (⚙️) in the left sidebar
   - Click on "API"
   - Copy these keys:
     - **Project URL** (should match your current URL)
     - **anon public** key
     - **service_role secret** key ⚠️ THIS IS THE IMPORTANT ONE

### Step 2: Update Backend .env File

Open `/backend/.env` and update:

```bash
# Supabase Configuration
SUPABASE_URL=https://vjfpqtyinumanvpgqlbj.supabase.co
SUPABASE_ANON_KEY=eyJ...  # Your anon public key
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ⚠️ Your NEW service_role secret key
```

**IMPORTANT:** The service role key should:
- Start with `eyJ`
- Be very long (several hundred characters)
- Have `"role":"service_role"` when decoded
- **NOT** be the anon key

### Step 3: Restart Backend

```bash
cd backend
pkill -f "node.*dist/index.js"
npm run dev
```

### Step 4: Test Again

```bash
curl http://localhost:3001/api/auth/test/db-check
```

Should now show `"accessible": true` for both tables!

### Step 5: Register New User

Once the test passes, try registering:
```bash
# Register a new client
curl -X POST http://localhost:3001/api/auth/register/client \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "mobile": "1234567890",
    "city": "Mumbai",
    "userType": "client"
  }'
```

Check backend logs for:
```
✅ Creating user record in database for: [user-id]
✅ User record created successfully
✅ Creating wallet balance for user: [user-id]
✅ Wallet balance created successfully
```

## Alternative: Check If Keys are Correct

You can verify your service role key by decoding it:

```bash
# Copy your SUPABASE_SERVICE_ROLE_KEY from .env
# Decode the JWT (just the middle part after first dot, before last dot)

echo "YOUR_KEY_MIDDLE_PART" | base64 -d 2>/dev/null
```

Should show:
```json
{
  "iss": "supabase",
  "ref": "vjfpqtyinumanvpgqlbj",
  "role": "service_role",  // ← THIS MUST BE "service_role"
  ...
}
```

If it says `"role": "anon"`, you're using the wrong key!

## Manual Database Record Creation (Temporary Fix)

While you fix the API key issue, you can manually create database records in Supabase:

1. Go to Supabase Dashboard → Table Editor

2. Create record in `users` table:
```sql
INSERT INTO users (id, email, full_name, phone, country_code, user_type, city, email_verified)
VALUES (
  'YOUR_USER_ID',  -- Get this from auth.users table
  'your@email.com',
  'Your Name',
  '1234567890',
  '+91',
  'client',
  'Your City',
  true
);
```

3. Create record in `wallet_balances` table:
```sql
INSERT INTO wallet_balances (user_id, balance, total_earnings, total_spent, pending_amount)
VALUES (
  'YOUR_USER_ID',  -- Same as above
  0,
  0,
  0,
  0
);
```

4. If you're a lawyer, also create in `lawyer_profiles`:
```sql
INSERT INTO lawyer_profiles (
  user_id, bar_number, experience_years, specialization,
  education, court_practice, languages, bio, consultation_fee,
  verified, rating, total_consultations, availability_status, is_active
)
VALUES (
  'YOUR_USER_ID',
  'BAR12345',
  5,
  'Criminal Law',
  'LLB from XYZ University',
  'Mumbai High Court',
  'English, Hindi',
  'Experienced lawyer',
  1000,
  false,
  0.0,
  0,
  'available',
  true
);
```

## Verify Database Records Exist

```sql
-- Check if user exists
SELECT * FROM users WHERE email = 'your@email.com';

-- Check if wallet exists
SELECT * FROM wallet_balances 
WHERE user_id = (SELECT id FROM users WHERE email = 'your@email.com');

-- If lawyer, check profile
SELECT * FROM lawyer_profiles 
WHERE user_id = (SELECT id FROM users WHERE email = 'your@email.com');
```

## After Fixing

Once you have valid API keys and restart the backend:

1. ✅ Test endpoint returns `accessible: true`
2. ✅ New user registration creates database records automatically
3. ✅ Existing user login creates missing records automatically
4. ✅ Dashboard loads without errors
5. ✅ No "Error fetching consultations" or "Error fetching wallet balance"

## Common Mistakes

❌ Using the **anon key** instead of **service_role key**
❌ Having spaces or line breaks in the .env file
❌ Not restarting the backend after changing .env
❌ Using keys from a different Supabase project
❌ Row Level Security (RLS) blocking the queries (service_role bypasses this)

## Emergency Contact

If still not working:
1. Share the output of: `curl http://localhost:3001/api/auth/test/db-check`
2. Share backend console logs when you try to register
3. Verify you can manually insert records in Supabase Table Editor

---
**Created:** November 15, 2025  
**Status:** ⚠️  Needs Supabase API Key Update
