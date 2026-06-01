# 🔄 Migration Plan: Custom Auth → Supabase Auth

## Why Migrate?

### Current Issues with Custom Auth:
- ❌ RLS doesn't work (had to disable it for `lawgpt_sessions`)
- ❌ Manual session management (JWT tokens, expiry, refresh)
- ❌ No built-in email verification
- ❌ No password reset functionality
- ❌ Manual security implementation
- ❌ Backend dependency (need to keep backend server running)

### Benefits of Supabase Auth:
- ✅ **RLS works automatically** - Secure by default
- ✅ **Email verification** - Built-in email flows
- ✅ **Password reset** - Forgot password out of the box
- ✅ **Session management** - Automatic token refresh
- ✅ **OAuth ready** - Google, GitHub, etc. (future)
- ✅ **No backend needed** - Direct client-to-Supabase
- ✅ **Better security** - Industry-standard implementation
- ✅ **User management** - Dashboard to manage users

## Current Architecture

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │ POST /api/auth/login
       │ POST /api/auth/signup
       ↓
┌─────────────┐
│   Backend   │      ┌──────────────┐
│  (Node.js)  │─────→│   Supabase   │
│             │      │  (Database)  │
└─────────────┘      └──────────────┘
                     • users table
                     • profiles table
```

## Target Architecture

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │ supabase.auth.signUp()
       │ supabase.auth.signIn()
       ↓
┌──────────────┐
│   Supabase   │
│    Auth +    │
│   Database   │
└──────────────┘
• auth.users (managed by Supabase)
• profiles (our custom data)
• lawgpt_sessions (with RLS!)
```

## Migration Steps

### Phase 1: Preparation (No Breaking Changes)
1. ✅ Keep existing custom auth working
2. ✅ Add Supabase Auth alongside (parallel systems)
3. ✅ Create migration script for existing users
4. ✅ Test Supabase Auth with new accounts

### Phase 2: Gradual Migration
1. ✅ New users sign up via Supabase Auth
2. ✅ Existing users can log in with both systems (fallback)
3. ✅ Prompt existing users to "upgrade" account

### Phase 3: Complete Switch
1. ✅ Remove custom backend auth endpoints
2. ✅ Enable RLS on all tables
3. ✅ Update all auth checks to use Supabase

### Phase 4: Cleanup
1. ✅ Remove backend auth code
2. ✅ Simplify backend (only business logic)
3. ✅ Update documentation

## Detailed Implementation

### Step 1: Set Up Supabase Auth

**In Supabase Dashboard:**
1. Go to **Authentication** → **Settings**
2. Enable **Email Confirmations** (optional, can disable for testing)
3. Configure **Email Templates** (customize welcome emails)
4. Set **Site URL** to `https://turn2law.tech`

### Step 2: Install Supabase Client (Already Done ✅)

```bash
# Already installed
npm install @supabase/supabase-js
```

### Step 3: Create New Auth Functions

**File: `/frontend/src/lib/supabase-auth.ts`** (NEW FILE)

```typescript
import { supabase } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  userType: 'client' | 'lawyer';
  phone?: string;
  city?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up with email/password
export const signUpWithEmail = async (data: SignUpData) => {
  const { email, password, fullName, userType, phone, city } = data;
  
  // 1. Create auth user in Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: userType,
        phone,
        city
      }
    }
  });

  if (authError) throw authError;

  // 2. Profile will be created automatically by trigger
  return { user: authData.user, session: authData.session };
};

// Sign in with email/password
export const signInWithEmail = async (data: SignInData) => {
  const { email, password } = data;
  
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return { user: authData.user, session: authData.session };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Password reset request
export const resetPasswordRequest = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://turn2law.tech/reset-password',
  });
  if (error) throw error;
};

// Update password
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
};
```

### Step 4: Update Database Trigger

**Run this SQL in Supabase to auto-create profiles:**

```sql
-- Function to create profile when new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    phone,
    city,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'user_type',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 5: Enable RLS on Tables

**Run this SQL to enable RLS on all tables:**

```sql
-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable RLS on lawgpt_sessions
ALTER TABLE lawgpt_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON lawgpt_sessions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create own sessions" ON lawgpt_sessions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON lawgpt_sessions
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON lawgpt_sessions
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Enable RLS on wallet_balances
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON wallet_balances
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Enable RLS on client_queries
ALTER TABLE client_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queries" ON client_queries
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own queries" ON client_queries
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

### Step 6: Update Login Page

**File: `/frontend/src/app/login/page.tsx`**

```typescript
"use client";

import { useState } from 'react';
import { signInWithEmail } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { user, session } = await signInWithEmail(formData);
      
      console.log('Login successful:', user);
      
      // Get user type from profile
      const { getUserProfile } = await import('@/lib/supabase');
      const profile = await getUserProfile(user.id);
      
      // Redirect based on user type
      if (profile?.user_type === 'lawyer') {
        router.push('/dashboard/lawyer');
      } else {
        router.push('/dashboard/client');
      }
      
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the component (UI stays the same)
};
```

### Step 7: Update Signup Page

**File: `/frontend/src/app/signup/page.tsx`**

```typescript
"use client";

import { useState } from 'react';
import { signUpWithEmail } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'client' as 'client' | 'lawyer',
    phone: '',
    city: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { user, session } = await signUpWithEmail(formData);
      
      console.log('Signup successful:', user);
      
      // Redirect to appropriate dashboard
      if (formData.userType === 'lawyer') {
        router.push('/dashboard/lawyer');
      } else {
        router.push('/dashboard/client');
      }
      
    } catch (error: any) {
      console.error('Signup failed:', error);
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the component
};
```

### Step 8: Update Dashboard Auth Check

**File: `/frontend/src/app/dashboard/client/page.tsx`**

```typescript
useEffect(() => {
  const loadDashboardData = async () => {
    try {
      // Check Supabase auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      const userId = session.user.id;
      const profile = await getUserProfile(userId);
      
      if (!profile) {
        router.push('/login');
        return;
      }
      
      // Check user type
      if (profile.user_type !== 'client') {
        router.push('/dashboard/lawyer');
        return;
      }
      
      setUser({
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        userType: profile.user_type,
        city: profile.city
      });
      
      // Load dashboard data
      // ...
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  loadDashboardData();
}, []);
```

### Step 9: Add Auth State Listener

**File: `/frontend/src/app/layout.tsx`** (or create AuthProvider)

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_OUT') {
        // Redirect to home if on protected page
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/lawgpt')) {
          router.push('/');
        }
      }
      
      if (event === 'SIGNED_IN' && session) {
        // User signed in
        console.log('User signed in:', session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return <>{children}</>;
}
```

### Step 10: Migrate Existing Users (Optional)

If you want to migrate existing users from custom auth to Supabase:

```typescript
// Migration script (run once)
async function migrateExistingUsers() {
  // 1. Get all users from your profiles table
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*');

  for (const profile of profiles) {
    try {
      // 2. Create Supabase auth user
      // Note: You'll need to use Supabase Admin API for this
      // Or ask users to reset their password
      
      console.log(`Migrated user: ${profile.email}`);
    } catch (error) {
      console.error(`Failed to migrate ${profile.email}:`, error);
    }
  }
}
```

## Testing Checklist

### Test Signup Flow:
- [ ] New user can sign up
- [ ] Profile is created automatically
- [ ] User is redirected to correct dashboard
- [ ] Email verification works (if enabled)

### Test Login Flow:
- [ ] User can log in with email/password
- [ ] Session persists across page reloads
- [ ] User is redirected to correct dashboard
- [ ] Auth state listener works

### Test Protected Routes:
- [ ] Dashboard requires authentication
- [ ] LawGPT requires authentication
- [ ] Wallet requires authentication
- [ ] Unauthenticated users are redirected to login

### Test RLS:
- [ ] Users can only see their own sessions
- [ ] Users can only see their own profile
- [ ] Users can only see their own wallet data

### Test Logout:
- [ ] User can log out
- [ ] Session is cleared
- [ ] User is redirected appropriately

## Rollback Plan

If something goes wrong, you can easily rollback:

1. Keep custom auth endpoints in backend (don't delete yet)
2. Add feature flag to switch between auth systems
3. Test thoroughly before removing custom auth

## Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Create supabase-auth.ts | 30 min | ⏳ Pending |
| 1 | Set up database triggers | 15 min | ⏳ Pending |
| 1 | Enable RLS policies | 15 min | ⏳ Pending |
| 2 | Update login page | 30 min | ⏳ Pending |
| 2 | Update signup page | 30 min | ⏳ Pending |
| 3 | Update dashboard pages | 1 hour | ⏳ Pending |
| 3 | Add auth state listener | 30 min | ⏳ Pending |
| 4 | Test all flows | 1 hour | ⏳ Pending |
| 4 | Fix bugs | 1 hour | ⏳ Pending |
| 5 | Deploy to production | 30 min | ⏳ Pending |
| **Total** | | **6 hours** | |

## Benefits Summary

### Security:
- ✅ Industry-standard auth implementation
- ✅ Automatic token refresh
- ✅ Built-in rate limiting
- ✅ RLS policies enforce data security

### Features:
- ✅ Email verification
- ✅ Password reset
- ✅ Session management
- ✅ Ready for OAuth (Google, GitHub, etc.)

### Development:
- ✅ Less code to maintain
- ✅ No backend auth endpoints needed
- ✅ Simplified architecture
- ✅ Better error handling

### User Experience:
- ✅ Faster login/signup
- ✅ "Remember me" works automatically
- ✅ Professional email templates
- ✅ Better error messages

## Next Steps

1. **Do you want me to implement this migration?**
   - I can create all the new files
   - Update existing auth logic
   - Set up the database triggers
   - Test everything

2. **Or would you prefer to keep custom auth?**
   - We can improve the current system
   - Add better security
   - But RLS will remain disabled

**My recommendation:** Migrate to Supabase Auth. It's the right move for production and will save you a lot of headaches later.

Let me know if you want me to start the implementation! 🚀
