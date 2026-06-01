# 🔧 FIX: Localhost URL in Production Reset Emails

## ⚠️ CRITICAL ISSUE

**Problem:** Password reset emails are linking to `http://localhost:3000` instead of your production domain `https://turn2law.com`

**Impact:** Users cannot reset their passwords in production ❌

---

## 🎯 Root Cause

Supabase's **Site URL** setting in the dashboard is set to `localhost:3000` instead of your production domain.

---

## ✅ COMPLETE FIX - 3 Steps

### Step 1: Update Supabase Dashboard Site URL (CRITICAL)

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard
   - Select your Turn2Law project (vjfpqtyinumanvpgqlbj)

2. **Navigate to Authentication Settings:**
   - Click **Settings** (left sidebar)
   - Click **Authentication**
   - Scroll to **Site URL** section

3. **Update Site URL:**
   ```
   CHANGE FROM: http://localhost:3000
   CHANGE TO:   https://turn2law.com
   ```

4. **Update Redirect URLs:**
   - In the **Redirect URLs** section, add:
   ```
   https://turn2law.com/api/auth/callback
   https://turn2law.com/reset-password
   https://turn2law.com/auth/callback
   ```
   
   - Remove or keep localhost URLs for development:
   ```
   http://localhost:3000/api/auth/callback
   http://localhost:3000/reset-password
   ```

5. **Click SAVE** ✅

---

### Step 2: Update Supabase Email Template

1. **Still in Supabase Dashboard:**
   - Click **Authentication** (left sidebar)
   - Click **Email Templates**
   - Select **"Reset Password"** template

2. **Update the template HTML:**

**Replace this:**
```html
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

**With this:**
```html
<p><a href="{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a></p>
```

**Complete template should be:**
```html
<h2>Reset Your Turn2Law Password</h2>
<p>We received a request to reset your password.</p>
<p>Click the link below to set a new password:</p>
<p><a href="{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a></p>
<p>This link expires in 1 hour.</p>
<br>
<p>If you didn't request this, please ignore this email.</p>
<p>Best regards,<br>Turn2Law Support Team<br>t2lhelpdesksup@gmail.com</p>
```

3. **Click SAVE** ✅

---

### Step 3: Redeploy Your Application (if needed)

If you're using Vercel/Netlify/etc., make sure your environment variables are set:

**Vercel Dashboard -> Settings -> Environment Variables:**
```bash
NEXT_PUBLIC_SITE_URL=https://turn2law.com
NEXT_PUBLIC_SUPABASE_URL=https://vjfpqtyinumanvpgqlbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then redeploy:
```bash
# Trigger a redeploy (if using Git-based deployment, this happens automatically)
git commit --allow-empty -m "Trigger redeploy for Supabase URL fix"
git push origin main
```

---

## 🧪 Testing the Fix

### Test 1: Request New Reset Email

```bash
1. Go to https://turn2law.com/reset-password
2. Enter your email
3. Click "Send Reset Link"
4. Check your email inbox
```

**✅ Expected:** Email link should be:
```
https://turn2law.com/api/auth/callback?token_hash=XXX&type=recovery
```

**❌ NOT:**
```
http://localhost:3000/api/auth/callback?token_hash=XXX&type=recovery
```

### Test 2: Click Reset Link

```bash
1. Click the reset link from email
2. Should redirect to: https://turn2law.com/reset-password?verified=true
3. Enter new password
4. Submit
```

**✅ Expected:** Password reset successful

### Test 3: Check URL

```bash
1. After clicking email link, check browser address bar
2. Should show: https://turn2law.com/reset-password?verified=true
```

**✅ Expected:** NO tokens in URL
**✅ Expected:** Using HTTPS
**✅ Expected:** Using production domain

---

## 🐛 Troubleshooting

### Issue: Still getting localhost URLs

**Solution:**
1. Clear browser cache
2. Request a **NEW** reset email (don't use old ones)
3. Verify Supabase Site URL is saved correctly
4. Wait 1-2 minutes for Supabase settings to propagate

### Issue: "Invalid redirect URL"

**Solution:**
1. Check that `https://turn2law.com/api/auth/callback` is in Supabase **Redirect URLs** list
2. Make sure URL matches exactly (no trailing slash)
3. Save and wait 1-2 minutes

### Issue: Reset link goes to 404

**Solution:**
1. Verify `/api/auth/callback/route.ts` exists in your codebase
2. Redeploy your application
3. Check deployment logs for errors

---

## 📋 Quick Verification Checklist

- [ ] Supabase Site URL changed from localhost to `https://turn2law.com`
- [ ] Supabase Redirect URLs include `https://turn2law.com/api/auth/callback`
- [ ] Email template updated to use `{{ .SiteURL }}/api/auth/callback`
- [ ] Environment variables set correctly in production
- [ ] Application redeployed (if needed)
- [ ] Requested NEW reset email
- [ ] Email link shows production domain (not localhost)
- [ ] Reset link works and redirects properly
- [ ] Password reset successful
- [ ] No tokens in final URL

---

## 🔑 Key Configuration Summary

### Supabase Dashboard Settings:

| Setting | Value |
|---------|-------|
| Site URL | `https://turn2law.com` |
| Redirect URLs | `https://turn2law.com/api/auth/callback`<br>`https://turn2law.com/reset-password` |
| Email Template Link | `{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery` |

### Environment Variables:

| Variable | Value |
|----------|-------|
| NEXT_PUBLIC_SITE_URL | `https://turn2law.com` |
| NEXT_PUBLIC_SUPABASE_URL | `https://vjfpqtyinumanvpgqlbj.supabase.co` |

### Code Changes:

| File | Change |
|------|--------|
| `/frontend/src/lib/supabase-auth.ts` | ✅ Updated to use `NEXT_PUBLIC_SITE_URL` |
| `/frontend/src/app/api/auth/callback/route.ts` | ✅ Already created |
| `/frontend/src/middleware.ts` | ✅ Already created |

---

## ⚡ Why This Happened

1. During development, Supabase Site URL was set to `localhost:3000`
2. This setting was never updated for production
3. Supabase uses this Site URL to generate email links
4. Even though your code uses `window.location.origin`, Supabase overrides it with the dashboard setting

---

## 🎯 Prevention

**Always check Supabase Site URL when deploying to production:**

```bash
Development: http://localhost:3000
Production:  https://turn2law.com
```

**Set up different Supabase projects for dev/prod:**
- Development project: localhost URLs
- Production project: production domain URLs

---

## 📞 Still Having Issues?

If reset emails still show localhost:

1. ✅ Verify Supabase Site URL is saved (refresh dashboard page)
2. ✅ Request a BRAND NEW reset email (don't reuse old ones)
3. ✅ Check email template was saved correctly
4. ✅ Clear browser cache and cookies
5. ✅ Try in incognito mode
6. ✅ Check Supabase project is correct (not a dev/staging project)

---

**Status:** ✅ Fix implemented - requires Supabase dashboard configuration
**Priority:** 🚨 CRITICAL - Blocking production password resets
**Estimated Time:** 5 minutes to configure
