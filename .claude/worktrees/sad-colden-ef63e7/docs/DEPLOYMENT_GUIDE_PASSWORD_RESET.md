# 🚀 DEPLOYMENT GUIDE - Bulletproof Password Reset Security

## ✅ Pre-Deployment Verification

Run the security verification script:

```bash
./verify-security.sh
```

**Expected Result:** All 17 checks should pass ✅

---

## 📋 Deployment Steps

### Step 1: Code Deployment

Deploy the following files to production:

```bash
# New files
frontend/src/app/api/auth/callback/route.ts
frontend/src/middleware.ts

# Updated files
frontend/src/app/reset-password/page.tsx
frontend/src/lib/supabase-auth.ts
```

**Deployment Commands:**

```bash
# If using Vercel
cd frontend
vercel --prod

# If using other platform
npm run build
# ... deploy build output
```

---

### Step 2: Update Supabase Email Template

**⚠️ CRITICAL:** This step is REQUIRED for the fix to work!

1. Go to your Supabase Dashboard
2. Navigate to: **Authentication → Email Templates**
3. Click on **"Change Email"** or **"Reset Password"** template
4. Find the confirmation URL line (usually near `{{ .ConfirmationURL }}`)
5. Replace it with:

```html
<a href="{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a>
```

**Before (Old - INSECURE):**
```html
{{ .SiteURL }}/reset-password#access_token={{ .Token }}
```

**After (New - SECURE):**
```html
{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery
```

6. Click **Save**

---

### Step 3: Verify Deployment

#### Test 1: Request Password Reset

```bash
1. Go to: https://yourdomain.com/reset-password
2. Enter your test email
3. Click "Send Reset Link"
4. Check email
```

**✅ Expected:** Email should contain link to `/api/auth/callback?token_hash=...`

**❌ Wrong:** Email contains link to `/reset-password#access_token=...`

#### Test 2: Complete Password Reset Flow

```bash
1. Click the reset link in email
2. Watch the URL in browser address bar
3. Should redirect to: /reset-password?verified=true
4. Password form should appear
5. Enter new password and confirm
6. Submit form
```

**✅ Expected:** 
- URL NEVER contains `access_token` or `refresh_token`
- Password form works
- Password is successfully reset

**❌ Wrong:**
- Tokens visible in URL at any point
- Form doesn't appear
- Error messages

#### Test 3: Check Browser DevTools

```bash
1. Open DevTools (F12)
2. Go to Network tab
3. Click reset link from email
4. Watch the requests
```

**✅ Expected Flow:**
```
1. GET /api/auth/callback?token_hash=XXX [Server]
2. 302 Redirect to /reset-password?verified=true [Server]  
3. GET /reset-password?verified=true [Client]
4. Password form renders
```

**No tokens in any URL!**

#### Test 4: Incognito Mode Test

```bash
1. Open incognito/private window
2. Paste reset link from email
3. Complete password reset
```

**✅ Expected:** Works normally, no tokens in URL

#### Test 5: Check Browser History

```bash
1. Complete password reset
2. Press Ctrl+H (Cmd+Y on Mac)
3. Search for "reset-password"
```

**✅ Expected:** Only `/reset-password?verified=true` in history

**❌ Wrong:** Any entry with tokens

---

## 🐛 Troubleshooting

### Issue: "Invalid or expired reset link"

**Possible Causes:**
1. Email template not updated
2. Old reset link (before deployment)
3. Cookies blocked

**Solutions:**
1. Update Supabase email template (Step 2)
2. Request NEW password reset (don't use old emails)
3. Check browser allows cookies
4. Check that `NEXT_PUBLIC_SUPABASE_URL` is correct

### Issue: Still seeing tokens in URL

**Possible Causes:**
1. Using old reset link
2. Email template not saved
3. Middleware not deployed

**Solutions:**
1. Request FRESH password reset email
2. Verify email template in Supabase dashboard
3. Verify middleware.ts is deployed
4. Clear browser cache
5. Check deployment logs

### Issue: Password form not appearing

**Possible Causes:**
1. Session not being set
2. API route not accessible
3. Cookie issues

**Solutions:**
1. Check browser console for errors
2. Check that `/api/auth/callback` returns 200
3. Verify cookies in DevTools → Application → Cookies
4. Check server logs for callback errors

### Issue: "This site can't be reached" for /api/auth/callback

**Possible Causes:**
1. API route not deployed
2. Build failed
3. Route configuration issue

**Solutions:**
1. Verify `frontend/src/app/api/auth/callback/route.ts` exists
2. Rebuild and redeploy
3. Check build logs for errors
4. Test route manually: `curl https://yourdomain.com/api/auth/callback`

---

## 📊 Monitoring

After deployment, monitor these:

### 1. Server Logs

Look for:
```
[Auth Callback] Processing password reset callback
[Auth Callback] Session established successfully
```

### 2. Security Warnings

Watch for:
```
⚠️ SECURITY WARNING: Tokens detected in URL
[Middleware] ⚠️ SECURITY: Blocked request with tokens
```

**If you see these:** Someone is using an old reset link or there's a configuration issue.

### 3. Error Logs

Watch for:
```
[Auth Callback] Code exchange error
[Reset Password] Session check error
```

---

## 🔒 Security Checklist

After deployment, verify:

- [ ] All code deployed to production
- [ ] Email template updated in Supabase
- [ ] Test password reset completed successfully
- [ ] No tokens visible in URL during any step
- [ ] Browser history clean (no tokens)
- [ ] Incognito mode test passed
- [ ] DevTools network tab shows secure flow
- [ ] Server logs show successful callbacks
- [ ] No security warnings in logs
- [ ] Old reset links no longer work

---

## 🔄 Rollback Plan

If issues occur:

### Option 1: Quick Fix
1. Revert Supabase email template to old version
2. Users can still reset passwords (but tokens will leak)
3. Fix issues and redeploy

### Option 2: Full Rollback
```bash
# Revert to previous deployment
git revert HEAD~1
vercel --prod

# Revert email template in Supabase
```

---

## 📞 Support Checklist

If password reset isn't working:

1. **Check email template:** Is it updated?
2. **Check deployment:** Are all files deployed?
3. **Check logs:** Any errors?
4. **Check URL:** Does it go to `/api/auth/callback` first?
5. **Check cookies:** Are they being set?
6. **Check browser:** Any console errors?

---

## ✅ Success Criteria

The deployment is successful when:

1. ✅ Users can reset passwords
2. ✅ No tokens ever appear in URLs
3. ✅ No tokens in browser history
4. ✅ Works in incognito mode
5. ✅ No security warnings in logs
6. ✅ All tests pass

---

## 📝 Post-Deployment

After successful deployment:

1. **Announce to team:** Password reset security improved
2. **Update documentation:** Link to TOKEN_LEAK_FIX_BULLETPROOF.md
3. **Monitor for 24h:** Watch logs for issues
4. **Test periodically:** Weekly password reset test
5. **Archive old reset emails:** They won't work anymore

---

## 🎉 Completion

Once all steps are complete and verified:

- Mark this as DEPLOYED in project tracker
- Update SECURITY_IMPLEMENTATION_SUMMARY.md
- Celebrate! 🎊 You've eliminated a critical security vulnerability

---

**Deployment Status:** Ready for Production
**Last Updated:** 2024
**Priority:** CRITICAL
