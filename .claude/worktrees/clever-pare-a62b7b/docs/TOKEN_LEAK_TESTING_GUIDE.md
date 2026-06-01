# 🔍 Token Leak Verification Guide

## How to Verify the Token Leak is Fixed

This guide will help you confirm that authentication tokens are no longer being exposed in your password reset flow.

---

## 🧪 Manual Testing Steps

### Test 1: Check URL for Token Exposure

#### Steps:
1. **Go to reset password page**
   ```
   Navigate to: https://your-domain.com/reset-password
   ```

2. **Request a password reset**
   - Enter your email address
   - Click "Send Reset Link"
   - Wait for confirmation

3. **Check your email**
   - Open the password reset email
   - Look at the link (don't click yet!)

4. **Inspect the link**
   ```
   ✅ GOOD (Secure):
   https://your-domain.com/reset-password?secure=true
   https://your-domain.com/reset-password
   
   ❌ BAD (Vulnerable):
   https://your-domain.com/reset-password?access_token=eyJhbGc...
   https://your-domain.com/reset-password?token=abc123...
   ```

5. **Click the reset link**
   - The page should load
   - **IMMEDIATELY check the URL bar**

6. **Verify URL is clean**
   ```
   ✅ Expected (Secure):
   https://your-domain.com/reset-password
   
   ❌ Not Expected (Still leaking):
   https://your-domain.com/reset-password?access_token=...
   https://your-domain.com/reset-password?type=recovery&...
   ```

**Result**: ✅ **PASS** if URL shows no token parameters

---

### Test 2: Check Browser History

#### Steps:
1. **After clicking the reset link** (from Test 1)

2. **Open browser history**
   - Chrome/Edge: `Ctrl+H` (Windows) or `Cmd+Y` (Mac)
   - Firefox: `Ctrl+H` (Windows) or `Cmd+Shift+H` (Mac)
   - Safari: `Cmd+Y` (Mac)

3. **Search for "reset-password" in history**

4. **Check all entries**
   ```
   ✅ GOOD (Secure):
   https://your-domain.com/reset-password
   https://your-domain.com/reset-password?secure=true
   
   ❌ BAD (Vulnerable):
   https://your-domain.com/reset-password?access_token=eyJhbG...
   https://your-domain.com/reset-password?token=abc123...
   ```

5. **Look for any long tokens or JWT strings**
   - JWT tokens look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Should NOT see any of these in history

**Result**: ✅ **PASS** if no tokens appear in browser history

---

### Test 3: Browser Developer Tools Check

#### Steps:
1. **Open your reset password page**

2. **Open Developer Tools**
   - Press `F12` or right-click → "Inspect"

3. **Go to "Network" tab**
   - Clear any existing logs
   - Enable "Preserve log"

4. **Click the reset link from email**

5. **Check Network requests**
   - Look at the request to `/reset-password`
   - Check the URL in the request

6. **Verify no token in URL**
   ```
   ✅ GOOD (Secure):
   Request URL: https://your-domain.com/reset-password
   Query String Parameters: (none) or secure=true
   
   ❌ BAD (Vulnerable):
   Request URL: https://your-domain.com/reset-password?access_token=...
   Query String Parameters: access_token=eyJhbG...
   ```

7. **Go to "Application" tab** (Chrome) or "Storage" tab (Firefox)
   - Navigate to "Cookies"
   - Look for cookies from your domain

8. **Verify session cookie exists**
   ```
   ✅ Expected:
   Name: sb-[project]-auth-token (or similar)
   HttpOnly: ✓ (checkmark)
   Secure: ✓ (checkmark)
   SameSite: Lax or Strict
   Value: (encrypted token - this is OK!)
   ```

**Result**: ✅ **PASS** if token is in secure cookie, not URL

---

### Test 4: Copy-Paste URL Test

#### Steps:
1. **While on the password reset page** (after clicking email link)

2. **Copy the URL from browser address bar**
   - Select all text in URL bar
   - Copy it (`Ctrl+C` or `Cmd+C`)

3. **Paste into a text editor**
   - Should see: `https://your-domain.com/reset-password`
   - Should NOT see any tokens

4. **Open a new incognito/private window**

5. **Paste the copied URL and visit it**

6. **What should happen:**
   ```
   ✅ SECURE (Expected):
   - Shows "Invalid or expired reset link" error
   - OR shows the request reset form (not the new password form)
   
   ❌ VULNERABLE (Bad):
   - Shows the "Set New Password" form
   - Allows setting password without the email link
   ```

**Result**: ✅ **PASS** if copied URL doesn't work for password reset

---

### Test 5: Server Log Check

#### Steps:
1. **Access your server logs**
   - For local development: Check terminal/console
   - For production: Access server log files

2. **Perform a password reset** (trigger the flow)

3. **Search logs for "reset-password"**

4. **Check logged URLs**
   ```
   ✅ GOOD (Secure):
   GET /reset-password HTTP/1.1
   GET /reset-password?secure=true HTTP/1.1
   
   ❌ BAD (Vulnerable):
   GET /reset-password?access_token=eyJhbG... HTTP/1.1
   GET /reset-password?token=abc123... HTTP/1.1
   ```

5. **Search for "access_token" or "eyJhbG"**
   - Should find ZERO results in access logs

**Result**: ✅ **PASS** if no tokens in server logs

---

### Test 6: Browser Console Check

#### Steps:
1. **On reset password page, open Console**
   - Press `F12` → "Console" tab

2. **Look for any logged token strings**
   - Search for "token", "jwt", "eyJhbG"

3. **Check for sensitive data**
   ```
   ✅ GOOD (Secure):
   [Supabase Auth] Password reset email sent
   [Reset Password] Valid reset session detected
   
   ❌ BAD (Vulnerable):
   access_token: eyJhbGciOiJIUzI1NiI...
   Token: abc123xyz...
   ```

**Result**: ✅ **PASS** if no tokens logged to console

---

### Test 7: Referrer Header Check (Advanced)

#### Steps:
1. **Install a browser extension to view headers**
   - Chrome: "HTTP Headers" extension
   - Firefox: "HTTP Header Live" add-on

2. **On the password reset form, add an external link**
   ```html
   <!-- Temporarily add this for testing -->
   <a href="https://google.com" target="_blank">Test Link</a>
   ```

3. **Click the test link**

4. **Check the Referrer header sent to Google**
   ```
   ✅ GOOD (Secure):
   Referer: https://your-domain.com/reset-password
   
   ❌ BAD (Vulnerable):
   Referer: https://your-domain.com/reset-password?access_token=...
   ```

**Result**: ✅ **PASS** if referrer doesn't contain tokens

---

## 🖥️ Automated Testing Script

Create a test script to automatically verify token security:

```javascript
// test-token-leak.js
const puppeteer = require('puppeteer');

async function testTokenLeak() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable request interception
  await page.setRequestInterception(true);
  
  let tokenFound = false;
  
  page.on('request', request => {
    const url = request.url();
    
    // Check if URL contains token-like patterns
    if (url.includes('access_token') || 
        url.includes('eyJhbG') || 
        url.match(/token=[a-zA-Z0-9-_]{20,}/)) {
      console.error('❌ TOKEN LEAK DETECTED in URL:', url);
      tokenFound = true;
    }
    
    request.continue();
  });
  
  // Navigate to reset password page
  await page.goto('http://localhost:3000/reset-password');
  
  // Wait a bit for any redirects
  await page.waitForTimeout(2000);
  
  // Check final URL
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  
  if (finalUrl.includes('access_token') || finalUrl.includes('token=')) {
    console.error('❌ TOKEN LEAK: Token found in final URL');
    tokenFound = true;
  } else {
    console.log('✅ SECURE: No token in URL');
  }
  
  // Check browser history
  const cookies = await page.cookies();
  console.log('\nCookies present:', cookies.length);
  
  const authCookie = cookies.find(c => 
    c.name.includes('auth') || c.name.includes('session')
  );
  
  if (authCookie) {
    console.log('✅ Auth cookie found:', authCookie.name);
    console.log('   HttpOnly:', authCookie.httpOnly);
    console.log('   Secure:', authCookie.secure);
    console.log('   SameSite:', authCookie.sameSite);
  }
  
  await browser.close();
  
  if (tokenFound) {
    console.error('\n❌ TEST FAILED: Token leak detected');
    process.exit(1);
  } else {
    console.log('\n✅ TEST PASSED: No token leak detected');
    process.exit(0);
  }
}

testTokenLeak().catch(console.error);
```

**To run:**
```bash
npm install puppeteer
node test-token-leak.js
```

---

## 📊 Security Checklist

Use this checklist to verify all aspects:

### URL Security
- [ ] No `access_token` in URL
- [ ] No `token=` parameter in URL
- [ ] No JWT tokens (eyJhbG...) in URL
- [ ] URL parameters cleared after page load
- [ ] Only `?secure=true` flag present (optional)

### Browser Security
- [ ] No tokens in browser history
- [ ] Tokens in HTTP-only cookies (not localStorage)
- [ ] Cookies have Secure flag
- [ ] Cookies have SameSite flag
- [ ] No tokens in console logs

### Server Security
- [ ] No tokens in server access logs
- [ ] No tokens in error logs
- [ ] Tokens only in secure session store

### Session Security
- [ ] Session-based validation works
- [ ] Copied URL doesn't allow access
- [ ] Old links don't work after password reset
- [ ] Session expires after 1 hour (or configured time)

### Network Security
- [ ] HTTPS enforced (no HTTP)
- [ ] No token in referrer headers
- [ ] No token in request URLs (Network tab)
- [ ] Token only in Cookie header

---

## 🚨 What If You Find a Token Leak?

If you discover a token is still being leaked:

### 1. Document the Issue
```
Where: Browser URL / History / Logs / Other
When: After clicking email link / On page load / Other
Format: ?access_token=xyz / ?token=abc / eyJhbG... / Other
Example URL: [paste the URL]
```

### 2. Check the Implementation
Look for these common mistakes:

```typescript
// ❌ BAD - Reading token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get('access_token');

// ✅ GOOD - Reading from session
const { data: { session } } = await supabase.auth.getSession();
```

### 3. Verify URL Cleaning
Make sure this code is present:

```typescript
// Must clear URL immediately
if (window.location.search) {
  window.history.replaceState({}, document.title, window.location.pathname);
}
```

### 4. Check Supabase Configuration
In your Supabase dashboard:
- Auth → URL Configuration
- Verify redirect URLs are correct
- Check that PKCE is enabled

---

## 🎯 Expected Results Summary

### ✅ SECURE Implementation (What You Should See)

**In URL Bar:**
```
https://turn2law.com/reset-password
```

**In Browser History:**
```
https://turn2law.com/reset-password
```

**In Cookies (Dev Tools):**
```
Name: sb-xxx-auth-token
HttpOnly: ✓
Secure: ✓
Value: [encrypted token] ← This is OK!
```

**In Server Logs:**
```
GET /reset-password HTTP/1.1 200
```

**Token Storage:**
```
✓ Secure HTTP-only cookie
✗ NOT in URL
✗ NOT in localStorage
✗ NOT in sessionStorage
✗ NOT in browser history
```

---

### ❌ VULNERABLE Implementation (What You Should NOT See)

**In URL Bar:**
```
❌ https://turn2law.com/reset-password?access_token=eyJhbG...
❌ https://turn2law.com/reset-password?token=abc123...
```

**In Browser History:**
```
❌ /reset-password?access_token=eyJhbG...
```

**In Server Logs:**
```
❌ GET /reset-password?access_token=eyJhbG... HTTP/1.1
```

**Token in Wrong Places:**
```
❌ URL parameters
❌ LocalStorage
❌ Console logs
❌ Referrer headers
```

---

## 🔧 Quick Verification Command

Run this in your browser console on the reset password page:

```javascript
// Paste this in browser console (F12 → Console tab)
(function checkTokenLeak() {
  console.log('🔍 Checking for Token Leak...\n');
  
  // Check URL
  const url = window.location.href;
  const hasTokenInUrl = url.includes('access_token') || 
                        url.includes('token=') || 
                        url.match(/eyJhbG[a-zA-Z0-9-_]+/);
  
  console.log('1. URL Check:');
  console.log('   URL:', url);
  console.log('   Has Token:', hasTokenInUrl ? '❌ LEAKED' : '✅ SECURE');
  
  // Check localStorage
  const lsToken = localStorage.getItem('access_token') || 
                  localStorage.getItem('token');
  console.log('\n2. LocalStorage Check:');
  console.log('   Has Token:', lsToken ? '❌ LEAKED' : '✅ SECURE');
  
  // Check sessionStorage
  const ssToken = sessionStorage.getItem('access_token') || 
                  sessionStorage.getItem('token');
  console.log('\n3. SessionStorage Check:');
  console.log('   Has Token:', ssToken ? '❌ LEAKED' : '✅ SECURE');
  
  // Check cookies
  const cookies = document.cookie.split(';');
  const authCookie = cookies.some(c => c.includes('auth') || c.includes('session'));
  console.log('\n4. Cookie Check:');
  console.log('   Has Auth Cookie:', authCookie ? '✅ SECURE' : '⚠️ NO COOKIE');
  console.log('   Note: HttpOnly cookies won\'t show here (that\'s good!)');
  
  // Final verdict
  console.log('\n═══════════════════════════════════');
  if (!hasTokenInUrl && !lsToken && !ssToken) {
    console.log('✅ VERDICT: SECURE - No token leaks detected!');
  } else {
    console.log('❌ VERDICT: VULNERABLE - Token leak detected!');
  }
  console.log('═══════════════════════════════════');
})();
```

---

## 📝 Testing Report Template

Use this template to document your testing:

```markdown
# Token Leak Security Test Report

**Date**: [Date]
**Tester**: [Your Name]
**Environment**: Development / Staging / Production

## Test Results

### Test 1: URL Token Exposure
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Test 2: Browser History
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 3: Developer Tools
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 4: Copy-Paste URL
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 5: Server Logs
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 6: Console Logs
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 7: Referrer Headers
- Status: ✅ PASS / ❌ FAIL
- Notes:

## Overall Result
- ✅ ALL TESTS PASSED - Token leak is fixed
- ❌ SOME TESTS FAILED - See notes above

## Screenshots
[Attach relevant screenshots]

## Recommendations
[Any additional security recommendations]
```

---

## 🎓 What You're Looking For (Summary)

### ✅ Good Signs (Secure):
1. Clean URL: `https://turn2law.com/reset-password`
2. Token in secure cookie (not visible in Dev Tools → Storage)
3. HttpOnly and Secure flags on cookie
4. No tokens in browser history
5. Copied URL doesn't work for reset
6. No tokens in console or server logs

### ❌ Bad Signs (Vulnerable):
1. Token in URL: `?access_token=...`
2. Token in localStorage or sessionStorage
3. Token visible in browser history
4. Copied URL allows password reset
5. Tokens in console.log or server logs
6. Token in non-HttpOnly cookies

---

**Remember**: The token should ONLY exist in a secure, HTTP-only cookie that's not accessible to JavaScript!

If all tests pass, your token leak is fixed! 🎉🔒
