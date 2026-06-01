# 🎯 STEP-BY-STEP: Fix Localhost URL in Password Reset Emails

## 🚨 THE PROBLEM

Your password reset emails are showing:
```
❌ http://localhost:3000/api/auth/callback?token_hash=...
```

Instead of:
```
✅ https://turn2law.com/api/auth/callback?token_hash=...
```

**This means users CANNOT reset their passwords in production!**

---

## ✅ THE FIX (5 Minutes)

### Step 1: Open Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Log in with your credentials
3. Click on your **Turn2Law** project
   - Project ID: `vjfpqtyinumanvpgqlbj`

---

### Step 2: Update Site URL

1. In the left sidebar, click **⚙️ Settings**
2. Click **Authentication** (under Settings)
3. Scroll down to find **"Site URL"** section
4. You will see a text input field with the current Site URL

**Current (WRONG):**
```
http://localhost:3000
```

**Change to (CORRECT):**
```
https://turn2law.com
```

5. Click **Save** button at the bottom

**✅ Checkpoint:** Site URL should now show `https://turn2law.com`

---

### Step 3: Update Redirect URLs

1. Still on the same page (Settings -> Authentication)
2. Scroll to **"Redirect URLs"** section
3. You'll see a list of allowed redirect URLs

**Add these URLs (if not already present):**
```
https://turn2law.com/api/auth/callback
https://turn2law.com/reset-password
https://turn2law.com/auth/callback
```

**You can keep localhost URLs for development:**
```
http://localhost:3000/api/auth/callback
http://localhost:3000/reset-password
```

4. Click **Save**

**✅ Checkpoint:** Production URLs should be in the redirect list

---

### Step 4: Update Email Template

1. In the left sidebar, click **🔐 Authentication**
2. Click **Email Templates** tab (at the top)
3. Find and click **"Reset Password"** template
4. You'll see the HTML template editor

**Find this line:**
```html
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

**Replace with:**
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

5. Click **Save** button

**✅ Checkpoint:** Email template now uses `{{ .SiteURL }}` and points to `/api/auth/callback`

---

## 🧪 TESTING THE FIX

### Test 1: Request New Reset Email

1. Open your production site: **https://turn2law.com/reset-password**
2. Enter your email address
3. Click "Send Reset Link"
4. Check your email inbox

**✅ Expected Result:**
- Email received within 1-2 minutes
- Email link should be: `https://turn2law.com/api/auth/callback?token_hash=...`
- **NOT:** `http://localhost:3000/...`

**❌ If still showing localhost:**
- Wait 2-3 minutes (settings need to propagate)
- Request ANOTHER new reset email
- Verify Site URL was saved correctly in Supabase

---

### Test 2: Click Reset Link

1. Open the email
2. Click the "Reset Password" link
3. Watch the browser URL bar

**✅ Expected Flow:**
```
1. Click link: https://turn2law.com/api/auth/callback?token_hash=XXX
   ↓
2. Server processes (you may see this briefly)
   ↓
3. Redirects to: https://turn2law.com/reset-password?verified=true
   ↓
4. Password reset form appears
```

**✅ Verify:**
- [ ] URL is `https://turn2law.com/reset-password?verified=true`
- [ ] NO `access_token` in URL
- [ ] NO `refresh_token` in URL
- [ ] Password reset form is visible
- [ ] No errors in browser console

---

### Test 3: Reset Password

1. Enter new password (must be strong: 8+ chars, uppercase, lowercase, number)
2. Confirm password
3. Click "Update Password"

**✅ Expected Result:**
- Success message appears
- Redirected to login or dashboard
- Can log in with new password

---

## 🐛 TROUBLESHOOTING

### Problem: Email still shows localhost

**Solution:**
1. ✅ Verify Supabase Site URL is `https://turn2law.com` (not localhost)
2. ✅ Click Save and wait 2-3 minutes
3. ✅ Request a BRAND NEW reset email (don't use old ones)
4. ✅ Check correct Supabase project (not dev/staging)

---

### Problem: "Invalid redirect URL" error

**Solution:**
1. ✅ Add `https://turn2law.com/api/auth/callback` to Redirect URLs
2. ✅ Make sure URL matches exactly (check for trailing slash)
3. ✅ Click Save
4. ✅ Request new reset email

---

### Problem: Clicking link goes to 404

**Solution:**
1. ✅ Verify your code has `/api/auth/callback/route.ts`
2. ✅ Redeploy your application
3. ✅ Check deployment logs for errors
4. ✅ Verify deployment is live

---

### Problem: Still see tokens in URL

**Solution:**
1. ✅ Clear browser cache and cookies
2. ✅ Try in incognito/private window
3. ✅ Request new reset email
4. ✅ Check email template was saved correctly

---

## 📋 QUICK CHECKLIST

### Before Testing:
- [ ] Supabase Site URL = `https://turn2law.com`
- [ ] Redirect URLs include `https://turn2law.com/api/auth/callback`
- [ ] Email template uses `{{ .SiteURL }}/api/auth/callback`
- [ ] Waited 2-3 minutes after saving

### During Testing:
- [ ] Requested NEW reset email (after changes)
- [ ] Email link shows production domain (not localhost)
- [ ] Clicked link successfully redirects
- [ ] Final URL is clean (no tokens)
- [ ] Password reset form appears
- [ ] Password reset works

### After Testing:
- [ ] Can log in with new password
- [ ] Old password doesn't work
- [ ] No errors in browser console
- [ ] No tokens in browser history

---

## 🎯 VISUAL GUIDE

### What You'll See in Supabase Dashboard:

**Settings -> Authentication:**
```
┌─────────────────────────────────────────┐
│ Site URL                                │
│ ┌─────────────────────────────────────┐ │
│ │ https://turn2law.com                │ │ ← Should be your domain
│ └─────────────────────────────────────┘ │
│                                         │
│ Redirect URLs                           │
│ ┌─────────────────────────────────────┐ │
│ │ https://turn2law.com/api/auth/callback │ ← Must include this
│ │ https://turn2law.com/reset-password    │ ← Must include this
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save]                                  │
└─────────────────────────────────────────┘
```

**Authentication -> Email Templates:**
```
┌─────────────────────────────────────────┐
│ Reset Password Template                 │
│ ┌─────────────────────────────────────┐ │
│ │ <h2>Reset Your Password</h2>        │ │
│ │ <p><a href="{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery">│
│ │   Reset Password                    │ │
│ │ </a></p>                            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save]                                  │
└─────────────────────────────────────────┘
```

---

## 📊 BEFORE vs AFTER

### BEFORE (Not Working)

**Supabase Settings:**
```
Site URL: http://localhost:3000 ❌
```

**Email Link:**
```
http://localhost:3000/api/auth/callback?token_hash=XXX ❌
```

**Result:**
```
User clicks link → Goes to localhost → Doesn't work ❌
```

---

### AFTER (Working)

**Supabase Settings:**
```
Site URL: https://turn2law.com ✅
```

**Email Link:**
```
https://turn2law.com/api/auth/callback?token_hash=XXX ✅
```

**Result:**
```
User clicks link → Goes to production → Works perfectly ✅
```

---

## 🎉 SUCCESS INDICATORS

You'll know it's working when:

1. ✅ Email link shows `https://turn2law.com` (not localhost)
2. ✅ Clicking link redirects to your production site
3. ✅ URL bar shows clean URL (no tokens)
4. ✅ Password reset form appears
5. ✅ Password reset completes successfully
6. ✅ Can log in with new password

---

## 💡 PRO TIPS

1. **Always test with NEW emails** - Old reset emails won't reflect the changes
2. **Wait 2-3 minutes** - Supabase settings take time to propagate
3. **Use incognito mode** - Avoids browser cache issues
4. **Check both places** - Site URL AND Email Template must be updated
5. **Keep localhost for dev** - You can have both prod and dev URLs in redirect list

---

## 📞 NEED HELP?

If you're still having issues:

1. Double-check all settings in Supabase dashboard
2. Request a fresh reset email (don't reuse old ones)
3. Clear browser cache completely
4. Try different browser or incognito mode
5. Check your deployment is live
6. Review `/docs/LOCALHOST_URL_FIX.md` for detailed troubleshooting

---

**Status:** Ready to fix ✅  
**Time Required:** 5 minutes  
**Difficulty:** Easy  
**Priority:** 🚨 CRITICAL
