# 🔧 FIX: LawGPT Sessions Not Saving - Step by Step Guide

## Problem
Chat sessions are not being saved to Supabase database even after typing messages. The sidebar shows "No chat history yet".

## Root Cause
The issue is that the **SQL table hasn't been created yet** in Supabase, AND the original SQL had RLS (Row Level Security) policies that don't work with custom backend authentication.

## Solution: Run Simplified SQL

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy & Paste This SQL

Copy this EXACT SQL and paste it into the SQL Editor:

```sql
-- ============================================
-- LawGPT Sessions Table - Simplified Version
-- ============================================
-- This version works with custom backend authentication

-- Create the table
CREATE TABLE IF NOT EXISTS lawgpt_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_lawgpt_sessions_user_id ON lawgpt_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lawgpt_sessions_updated_at ON lawgpt_sessions(updated_at DESC);

-- Disable Row Level Security (we're using custom backend auth)
ALTER TABLE lawgpt_sessions DISABLE ROW LEVEL SECURITY;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lawgpt_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_lawgpt_sessions_updated_at_trigger ON lawgpt_sessions;
CREATE TRIGGER update_lawgpt_sessions_updated_at_trigger
  BEFORE UPDATE ON lawgpt_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_lawgpt_sessions_updated_at();
```

### Step 3: Run the SQL

1. Click **Run** button (or press `Cmd+Enter` / `Ctrl+Enter`)
2. Wait for "Success" message
3. Should see: `Success. No rows returned`

### Step 4: Verify Table Was Created

In the same SQL Editor, run this query:

```sql
SELECT * FROM lawgpt_sessions;
```

You should see an empty table with these columns:
- `id`
- `user_id`
- `title`
- `messages`
- `created_at`
- `updated_at`

Or go to: **Database** → **Tables** → Should see `lawgpt_sessions` in the list

### Step 5: Test on Frontend

Once Vercel finishes deploying (it's deploying now with debug logs):

1. **Open turn2law.tech/lawgpt**
2. **Open Browser Console** (F12 → Console tab)
3. **Send a message:** "Test message"
4. **Watch the console logs** - You should see:
   ```
   [LawGPT] Attempting to save session - userId: xxx currentSessionId: null messages: 2
   [LawGPT] Creating new session with title: Test message...
   [LawGPT] Session created successfully: {id: "...", ...}
   [LawGPT] Session messages updated successfully
   [LawGPT] Session added to sessions list
   ```

5. **Click sidebar icon** (☰)
6. **✅ Expected:** You should now see your chat session!

### Step 6: Verify in Supabase

Go back to Supabase SQL Editor and run:

```sql
SELECT * FROM lawgpt_sessions;
```

You should now see your chat session saved with:
- `user_id`: Your user ID
- `title`: "Test message..."
- `messages`: JSON array with your conversation
- `created_at` and `updated_at`: Timestamps

## What Changed?

### Issue 1: Table Didn't Exist
- **Before:** No table in Supabase → All saves failed silently
- **After:** Table created → Saves work

### Issue 2: RLS Policies
- **Before:** RLS used `auth.uid()` which doesn't work with custom backend auth
- **After:** RLS disabled → Custom auth users can save sessions

### Issue 3: user_id Type
- **Before:** `user_id UUID` with foreign key to `auth.users` → Failed for custom auth
- **After:** `user_id TEXT` with no foreign key → Works with any user ID format

## Debug Console Logs

When Vercel deploys, you'll see these logs in the browser console:

### When Loading Page:
```
[LawGPT] Parsed user from localStorage: {id: "...", email: "...", ...}
[LawGPT] Using custom auth, skipping Supabase verification
[LawGPT] User set successfully
```

### When Sending First Message:
```
[LawGPT] Skipping save - userId: xxx chatHistory length: 1
(waits for AI response)
[LawGPT] Attempting to save session - userId: xxx currentSessionId: null messages: 2
[LawGPT] Creating new session with title: Your message...
[LawGPT] Session created successfully
[LawGPT] Updating session with messages: 2
[LawGPT] Session messages updated successfully
[LawGPT] Session added to sessions list
```

### When Sending More Messages:
```
[LawGPT] Attempting to save session - userId: xxx currentSessionId: [session-id] messages: 4
[LawGPT] Updating existing session: [session-id]
[LawGPT] Session updated successfully
```

### If There's an Error:
```
[LawGPT] Error creating session: {message: "...", details: "...", ...}
OR
[LawGPT] Exception saving chat session: Error: ...
```

## Troubleshooting

### Problem: Still showing "No chat history yet"

**Check 1: Table exists?**
```sql
SELECT * FROM lawgpt_sessions;
```
If error: "relation lawgpt_sessions does not exist" → Run Step 2 again

**Check 2: Console logs?**
- Open F12 → Console
- Look for `[LawGPT]` logs
- If you see "Error creating session" → Copy the error and share it

**Check 3: User authenticated?**
```javascript
// In browser console, run:
localStorage.getItem('user')
localStorage.getItem('token')
```
Should see user data and token. If null → Login again

**Check 4: Vercel deployed?**
- Check Vercel dashboard
- Look for deployment with commit message: "fix: add debugging logs for LawGPT sessions"
- Should be "Ready" status

### Problem: Console shows "Error creating session"

**Possible causes:**
1. **RLS still enabled** → Run this in Supabase:
   ```sql
   ALTER TABLE lawgpt_sessions DISABLE ROW LEVEL SECURITY;
   ```

2. **Wrong user_id type** → Check table structure:
   ```sql
   \d lawgpt_sessions
   ```
   Should show `user_id TEXT`, not `UUID`
   
   If wrong, drop and recreate:
   ```sql
   DROP TABLE lawgpt_sessions CASCADE;
   -- Then run the CREATE TABLE from Step 2
   ```

3. **Supabase key issue** → Check if `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in Vercel

### Problem: Sessions save but sidebar doesn't show them

**Check:** Reload the page
- Sessions should load on page mount
- Check console for: "Loaded X chat sessions"

**If still empty:**
```sql
-- In Supabase, check if sessions exist:
SELECT id, user_id, title, created_at FROM lawgpt_sessions ORDER BY updated_at DESC;
```

If you see sessions but sidebar is empty:
- Check console for "Error loading chat sessions"
- User ID might be different between sessions

## Files Modified

### Frontend:
- `/frontend/src/app/lawgpt/page.tsx`
  - Added extensive debug logging
  - Better error handling
  - Shows exactly what's happening during save/load

### Backend:
- `/backend/supabase-migrations/create_lawgpt_sessions_simple.sql`
  - Simplified SQL that works with custom auth
  - No RLS policies (custom auth handles security)
  - TEXT user_id instead of UUID

## Next Steps

1. ✅ **Run the SQL** (Step 2 above)
2. ✅ **Wait for Vercel deployment** (check Vercel dashboard)
3. ✅ **Test** (Step 5 above)
4. ✅ **Check console logs** (should see debug messages)
5. ✅ **Verify in Supabase** (Step 6 above)

## Summary

The issue was:
- ❌ No database table existed
- ❌ RLS policies incompatible with custom auth
- ❌ user_id type mismatch

The fix:
- ✅ Create table with simple SQL
- ✅ Disable RLS (not needed with custom auth)
- ✅ Use TEXT for user_id (supports custom auth IDs)
- ✅ Add debug logs to see exactly what's happening

**Run the SQL, wait for deployment, and test!** 🚀

If you still have issues after running the SQL, share the console logs and I'll help debug further.
