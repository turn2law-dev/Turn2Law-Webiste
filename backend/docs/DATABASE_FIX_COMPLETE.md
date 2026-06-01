# Database Integration Fix - Supabase Records Creation

## Problem
After successful login, users were seeing console errors:
```
Error fetching consultations: {}
Error fetching wallet balance: {}
```

The dashboard pages couldn't load user data because the Supabase database tables (`users`, `lawyer_profiles`, `wallet_balances`, etc.) had no records, even though Supabase Auth users existed.

## Root Cause
Your backend was creating **Supabase Auth users** but **NOT creating corresponding database records** in the tables:
- `users` table
- `lawyer_profiles` table (for lawyers)
- `wallet_balances` table

This caused the frontend to fail when fetching data from these tables.

## Solution Implemented - Option 2

Updated the backend to **automatically create database records** when users register or login.

### Files Modified

#### 1. **Backend Auth API** (`/backend/src/api/auth.ts`)

**Changes Made:**

##### A. Import Admin Client
```typescript
import { supabase, supabaseAdmin } from '../config/supabase';
```
- Added `supabaseAdmin` import to bypass Row Level Security (RLS)

##### B. Client Registration (`/register/client`)
Now creates 2 database records:
1. **User record** in `users` table
2. **Wallet balance** in `wallet_balances` table

```typescript
// Insert user record
await supabaseAdmin.from('users').insert({
  id: authUser.user.id,
  email: email,
  full_name: name,
  phone: mobile,
  country_code: countryCode,
  user_type: 'client',
  city: city,
  email_verified: false
});

// Create wallet
await supabaseAdmin.from('wallet_balances').insert({
  user_id: authUser.user.id,
  balance: 0,
  total_earnings: 0,
  total_spent: 0,
  pending_amount: 0
});
```

##### C. Lawyer Registration (`/register/lawyer`)
Now creates 3 database records:
1. **User record** in `users` table
2. **Lawyer profile** in `lawyer_profiles` table
3. **Wallet balance** in `wallet_balances` table

```typescript
// Insert user record
await supabaseAdmin.from('users').insert({...});

// Insert lawyer profile
await supabaseAdmin.from('lawyer_profiles').insert({
  user_id: authUser.user.id,
  bar_number: barNumber,
  experience_years: parseInt(experience),
  specialization: specialization,
  education: education,
  court_practice: courtPractice,
  languages: languages,
  bio: bio,
  consultation_fee: parseFloat(consultationFee),
  profile_image_url: profileImageUrl,
  verified: false,
  // ... other fields
});

// Create wallet
await supabaseAdmin.from('wallet_balances').insert({...});
```

##### D. Login Endpoint (`/login`) - BACKFILL LOGIC
Added **automatic record creation** for existing users who don't have database records:

```typescript
// Check if user record exists
const { data: existingUser } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();

if (!existingUser) {
  // Create missing user record
  await supabaseAdmin.from('users').insert({...});
  
  // Create missing wallet
  await supabaseAdmin.from('wallet_balances').insert({...});
  
  // If lawyer, create missing profile
  if (userType === 'lawyer') {
    await supabaseAdmin.from('lawyer_profiles').insert({...});
  }
}
```

## Why Use `supabaseAdmin` Instead of `supabase`?

**Row Level Security (RLS)** is enabled on your database tables. The regular `supabase` client enforces RLS policies, which prevent inserting records during registration (no authenticated user context yet).

**`supabaseAdmin`** uses the service role key and **bypasses RLS**, allowing record creation even when no user is authenticated.

## Database Tables Structure

### 1. `users` table
Stores basic user information for both clients and lawyers:
```sql
- id (UUID, matches auth.users.id)
- email
- full_name
- phone
- country_code
- user_type ('client' | 'lawyer')
- city (for clients)
- profile_image_url
- email_verified
- created_at, updated_at
```

### 2. `lawyer_profiles` table
Extended information for lawyers only:
```sql
- id (UUID)
- user_id (references users.id)
- bar_number
- experience_years
- specialization
- education
- court_practice
- languages
- bio
- consultation_fee
- verified
- rating
- total_consultations
- availability_status
- created_at, updated_at
```

### 3. `wallet_balances` table
Financial tracking for all users:
```sql
- id (UUID)
- user_id (references users.id)
- balance
- total_earnings
- total_spent
- pending_amount
- created_at, updated_at
```

## Testing Instructions

### For New Users (Registration)

1. **Register a new client:**
   ```
   POST http://localhost:3001/api/auth/register/client
   ```
   ✅ Should create: `users` record + `wallet_balances` record

2. **Register a new lawyer:**
   ```
   POST http://localhost:3001/api/auth/register/lawyer
   ```
   ✅ Should create: `users` record + `lawyer_profiles` record + `wallet_balances` record

3. **Verify in Supabase:**
   - Go to Supabase Dashboard → Table Editor
   - Check `users` table for new record
   - Check `wallet_balances` table for corresponding record
   - If lawyer, check `lawyer_profiles` table

### For Existing Users (Login Backfill)

1. **Login with existing account:**
   ```
   POST http://localhost:3001/api/auth/login
   Body: { "email": "...", "password": "..." }
   ```

2. **Backend will automatically:**
   - Check if database records exist
   - Create missing records from auth metadata
   - Return user data with complete profile

3. **Verify dashboard loads without errors:**
   - Navigate to `/dashboard/client` or `/dashboard/lawyer`
   - Check browser console - should have NO errors
   - Data should load properly (consultations, wallet, etc.)

## Restart Backend Server

After making these changes, restart your backend:

```bash
cd backend
npm run dev
```

Or if already running:
```bash
# Kill existing process
pkill -f "node.*dist/index.js"

# Start fresh
cd backend && npm run dev
```

## Expected Behavior After Fix

### Before Login:
❌ Auth user exists in Supabase Auth
❌ NO records in database tables
❌ Dashboard shows errors

### After Login (With Fix):
✅ Auth user exists in Supabase Auth
✅ Records created in database tables automatically
✅ Dashboard loads all data successfully
✅ No console errors

## Troubleshooting

### Still seeing "Error fetching..." messages?

1. **Check Backend Logs:**
   ```bash
   # Watch backend console for errors
   cd backend && npm run dev
   ```
   Look for messages like:
   - "Error creating user record:"
   - "Error creating wallet balance:"

2. **Verify Supabase Service Key:**
   ```bash
   # Check .env file
   cat backend/.env | grep SUPABASE_SERVICE_ROLE_KEY
   ```
   Should have a valid service role key (starts with `eyJ...`)

3. **Check Database Tables:**
   - Go to Supabase Dashboard
   - SQL Editor → Run:
   ```sql
   SELECT * FROM users WHERE id = 'your-user-id';
   SELECT * FROM wallet_balances WHERE user_id = 'your-user-id';
   SELECT * FROM lawyer_profiles WHERE user_id = 'your-user-id'; -- if lawyer
   ```

4. **Clear and Re-login:**
   ```javascript
   // Browser console
   localStorage.clear();
   // Then login again
   ```

### Database Records Not Creating?

Check RLS policies:
```sql
-- In Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename IN ('users', 'lawyer_profiles', 'wallet_balances');
```

Ensure service role can insert:
```sql
-- Test insert with service role key
INSERT INTO users (id, email, full_name, phone, user_type, country_code)
VALUES (uuid_generate_v4(), 'test@test.com', 'Test User', '1234567890', 'client', '+91');
```

## Environment Variables Required

Ensure these are in `/backend/.env`:
```env
SUPABASE_URL=https://vjfpqtyinumanvpgqlbj.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ⚠️ IMPORTANT - Must have this!
JWT_SECRET=your-secret-key
JWT_EXPIRE_IN=7d
```

## Future Improvements

Consider adding a database trigger to auto-create records:

```sql
-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, full_name, user_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'user_type', 'client')
  );
  
  -- Create wallet balance
  INSERT INTO public.wallet_balances (user_id, balance, total_earnings, total_spent)
  VALUES (new.id, 0, 0, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

This would automatically create database records whenever a Supabase Auth user is created, eliminating the need for manual insertion in the backend code.

---
**Updated:** November 15, 2025  
**Status:** ✅ Complete  
**Issue:** Missing database records causing dashboard errors  
**Resolution:** Backend now creates all required database records during registration and login
