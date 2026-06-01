# Supabase Auth Migration - Implementation Guide

## ✅ Completed Steps

### 1. Code Migration (Frontend)
- ✅ **Login Page** - Migrated to use `signInWithEmail()` from Supabase Auth
- ✅ **Signup Page** - Migrated to use `signUpWithEmail()` from Supabase Auth
- ✅ **Dashboard** - Updated to check Supabase session instead of localStorage
- ✅ **Auth Guard** - Created reusable component for protecting routes
- ✅ **Theme** - Light mode is now the default

### 2. Database Migrations (SQL)
- ✅ **Profile Trigger** - Created auto-profile creation trigger (`create_profile_trigger.sql`)
- ✅ **RLS Policies** - Created comprehensive RLS policies (`enable_rls_policies.sql`)

## 📋 Remaining Steps

### Step 1: Run Database Migrations on Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: Turn2Law

2. **Run Profile Trigger Migration**
   - Go to SQL Editor
   - Copy the contents of `/backend/supabase-migrations/create_profile_trigger.sql`
   - Paste and execute
   - Verify: You should see a success message

3. **Run RLS Policies Migration**
   - In SQL Editor, create a new query
   - Copy the contents of `/backend/supabase-migrations/enable_rls_policies.sql`
   - Paste and execute
   - Verify: Check that all tables have `rowsecurity = true`

4. **Verify Migrations**
   ```sql
   -- Check if trigger exists
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   
   -- Check RLS is enabled
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('profiles', 'lawgpt_sessions');
   
   -- Check policies exist
   SELECT tablename, policyname FROM pg_policies 
   WHERE schemaname = 'public';
   ```

### Step 2: Update Environment Variables

Ensure your `.env.local` has:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Test the Migration

#### Test Signup Flow
1. Go to `/signup`
2. Register as a Client with test email
3. Check Supabase Auth dashboard - user should appear
4. Check `profiles` table - profile should be auto-created
5. Verify RLS - try to query another user's profile (should fail)

#### Test Login Flow
1. Go to `/login`
2. Login with the test account
3. Should redirect to `/dashboard/client`
4. Check browser console - should see Supabase Auth logs
5. Session should persist across page refreshes

#### Test Protected Routes
1. Without login, try to access `/dashboard/client`
2. Should redirect to `/login`
3. Login as lawyer, try to access `/dashboard/client`
4. Should redirect to `/dashboard/lawyer`

#### Test LawGPT with New Auth
1. Login as a client
2. Go to `/lawgpt`
3. Start a chat session
4. Verify chat history saves with your user ID
5. Refresh page - chat history should load

### Step 4: Remove Custom Backend Auth (Optional)

⚠️ **ONLY DO THIS AFTER CONFIRMING SUPABASE AUTH WORKS**

1. **Stop Using Custom Auth Endpoints**
   - Remove or comment out routes in `/backend/src/index.ts`:
     - `POST /api/auth/register/client`
     - `POST /api/auth/register/lawyer`
     - `POST /api/auth/login`
   
2. **Clean Up Frontend Code**
   - Remove the following localStorage keys (add cleanup code):
     ```typescript
     localStorage.removeItem('isCustomAuth');
     ```

3. **Update Backend for Supabase Verification**
   - If your backend needs to verify user sessions:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   // Verify token from frontend
   const supabase = createClient(supabaseUrl, supabaseAnonKey);
   const { data: { user }, error } = await supabase.auth.getUser(token);
   ```

### Step 5: Data Migration (Optional)

If you have existing users in the old system:

1. **Export existing users**
   - Get list of users from your old database
   
2. **Create Supabase Auth accounts**
   ```typescript
   // Use Supabase Admin API
   const { createClient } = require('@supabase/supabase-js');
   const supabase = createClient(url, serviceRoleKey);
   
   for (const oldUser of oldUsers) {
     const { data, error } = await supabase.auth.admin.createUser({
       email: oldUser.email,
       password: generateTemporaryPassword(),
       email_confirm: true,
       user_metadata: {
         full_name: oldUser.name,
         user_type: oldUser.userType,
         phone: oldUser.phone,
         city: oldUser.city
       }
     });
   }
   ```

3. **Send password reset emails**
   - Have users reset their passwords via email

### Step 6: Deploy to Production

1. **Commit All Changes**
   ```bash
   cd "Turn2law Website"
   git add .
   git commit -m "Migrate to Supabase Auth with RLS"
   git push origin main
   ```

2. **Verify Vercel Deployment**
   - Check Vercel dashboard for successful build
   - Test production site thoroughly

3. **Monitor for Issues**
   - Check Vercel logs
   - Check Supabase Auth logs
   - Monitor for authentication errors

## 🔍 Troubleshooting

### Issue: "Profile not found" error
**Solution:** Run the profile trigger migration and test signup again

### Issue: RLS blocking queries
**Solution:** Verify policies are correct and user is authenticated

### Issue: Email verification not working
**Solution:** Check Supabase Auth settings for email templates and confirmation settings

### Issue: Session not persisting
**Solution:** Check that cookies are enabled and Supabase URL/keys are correct

## 📊 What Changed?

### Before (Custom Auth)
```typescript
// Login
fetch('/api/auth/login', { email, password })
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))

// Protected route
const token = localStorage.getItem('token')
if (!token) redirect('/login')
```

### After (Supabase Auth)
```typescript
// Login
signInWithEmail({ email, password })
// Session handled automatically by Supabase

// Protected route
const session = await getSession()
if (!session) redirect('/login')
```

## 🎉 Benefits

1. **Security**
   - Industry-standard authentication
   - Automatic token refresh
   - Built-in session management
   - Row Level Security (RLS) protecting all data

2. **Features**
   - Email verification
   - Password reset
   - OAuth providers (Google, GitHub, etc.)
   - Multi-factor authentication (MFA)

3. **Maintenance**
   - No custom auth code to maintain
   - Automatic security updates
   - Built-in rate limiting
   - Better session management

## 🚀 Next Steps After Migration

1. **Add Email Verification**
   - Configure email templates in Supabase
   - Add UI for "Verify your email" message

2. **Add Password Reset Flow**
   - Create `/reset-password` page
   - Implement password update form

3. **Add OAuth Providers**
   - Enable Google Sign-In
   - Add social login buttons

4. **Add Profile Image Upload**
   - Use Supabase Storage
   - Update profile with avatar URL

5. **Implement MFA (Optional)**
   - Enable in Supabase Auth settings
   - Add MFA enrollment UI

## 📝 Important Notes

- **Email Verification:** By default, Supabase requires email verification. You can disable this in Supabase Auth settings if needed for testing.
- **RLS:** Always test RLS policies thoroughly - they are your primary data security layer.
- **Sessions:** Supabase sessions expire after 1 hour by default but auto-refresh.
- **Backward Compatibility:** Old custom auth won't work after migration. Plan accordingly.

## ✅ Migration Checklist

- [ ] Run `create_profile_trigger.sql` in Supabase
- [ ] Run `enable_rls_policies.sql` in Supabase
- [ ] Test signup flow (client)
- [ ] Test signup flow (lawyer)
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test protected routes
- [ ] Test LawGPT with new auth
- [ ] Test RLS policies
- [ ] Deploy to production
- [ ] Remove custom backend auth (optional)
- [ ] Migrate existing users (optional)
- [ ] Update documentation
- [ ] Inform users of changes

---

**Status:** Ready for testing  
**Last Updated:** $(date)  
**Next Action:** Run database migrations in Supabase Dashboard
