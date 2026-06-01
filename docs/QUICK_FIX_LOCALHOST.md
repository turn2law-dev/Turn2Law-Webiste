# 🎯 QUICK FIX: Password Reset Localhost Issue

## The Problem
Password reset emails are linking to `http://localhost:3000` instead of your production domain `https://turn2law.com`.

## The Root Cause
Your **Supabase Site URL** setting is still configured for development (localhost) instead of production.

---

## ⚡ 5-MINUTE FIX

### 1️⃣ Update Supabase Site URL

**Dashboard:** https://supabase.com/dashboard → Settings → Authentication

```
CHANGE: http://localhost:3000
TO:     https://turn2law.com
```

### 2️⃣ Add Redirect URLs

**Same page:** Add these to Redirect URLs:

```
https://turn2law.com/api/auth/callback
https://turn2law.com/reset-password
```

### 3️⃣ Update Email Template

**Dashboard:** Authentication → Email Templates → Reset Password

```html
CHANGE: <a href="{{ .ConfirmationURL }}">Reset Password</a>

TO:     <a href="{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a>
```

### 4️⃣ Test

1. Request NEW password reset email
2. Email link should show: `https://turn2law.com/api/auth/callback?...`
3. Click link → should redirect to: `https://turn2law.com/reset-password?verified=true`
4. Reset password successfully ✅

---

## 📚 Detailed Guides

- **Step-by-step with screenshots:** `/docs/STEP_BY_STEP_LOCALHOST_FIX.md`
- **Complete troubleshooting:** `/docs/LOCALHOST_URL_FIX.md`
- **Security implementation:** `/docs/TOKEN_LEAK_FIX_BULLETPROOF.md`

---

## ✅ Quick Verification

Run this script to check your configuration:

```bash
./check-reset-config.sh
```

---

## 🔑 Key Points

- ✅ Code is already fixed and deployed
- ⚠️ Only need to update Supabase dashboard settings
- 🚨 Must request NEW reset emails after changes
- ⏱️ Settings take 2-3 minutes to propagate

---

**Status:** Ready to fix  
**Time:** 5 minutes  
**Priority:** CRITICAL
