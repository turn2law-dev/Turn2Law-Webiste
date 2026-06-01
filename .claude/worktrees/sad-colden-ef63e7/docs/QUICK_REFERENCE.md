# Quick Reference Guide - Refactored Features

## 🎯 At a Glance

### What's Been Completed?
✅ **4 Major Refactors**
- Client Wallet (Paytm + Supabase)
- Lawyer Wallet (Paytm + Supabase)
- LawGPT Persistence (Supabase sessions)
- Real-time Messaging (Supabase subscriptions)

✅ **Mock Data Removed**: 100%
✅ **Razorpay Removed**: 100%
✅ **Supabase Connected**: 100%
✅ **Ready for Production**: After Paytm setup

---

## 🔧 Quick Setup (5 Minutes)

### Step 1: Install Paytm SDK
```bash
cd frontend
npm install paytmchecksum
```

### Step 2: Add Environment Variables
Add to `frontend/.env.local`:
```env
# Paytm (Get from https://business.paytm.com/)
PAYTM_MERCHANT_ID=your_merchant_id
PAYTM_MERCHANT_KEY=your_merchant_key
PAYTM_WEBSITE=WEBSTAGING
PAYTM_INDUSTRY_TYPE=Retail
PAYTM_CHANNEL_ID=WEB
PAYTM_CALLBACK_URL=http://localhost:3000/api/paytm/callback

# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Step 3: Uncomment Paytm Code
**Files to update:**
1. `/frontend/src/app/api/paytm/initiate-payment/route.ts`
2. `/frontend/src/app/api/paytm/callback/route.ts`

**Action**: Uncomment the Paytm integration code blocks

### Step 4: Test
```bash
npm run dev
# Navigate to http://localhost:3000/dashboard/client/wallet
# Try adding money (test mode works without Paytm credentials)
```

---

## 📱 Feature Usage Guide

### **Client: Add Money to Wallet**
```
1. Go to /dashboard/client/wallet
2. Click "Add Money"
3. Enter amount (₹100 - ₹100,000)
4. Click "Proceed to Pay"
5. Redirects to Paytm (or simulates in test mode)
6. Returns to wallet with updated balance
```

### **Client: Withdraw Funds**
```
1. Go to /dashboard/client/wallet
2. Click "Withdraw"
3. Enter amount (min ₹500)
4. Confirm withdrawal
5. Status shows "Pending"
6. Processed within 2-3 business days
```

### **Lawyer: View Earnings**
```
1. Go to /dashboard/lawyer/wallet
2. See:
   - Current balance
   - Monthly earnings
   - Total consultations
   - Average fee
3. All data from real consultations
```

### **Lawyer: Withdraw Earnings**
```
1. Go to /dashboard/lawyer/wallet
2. Click "Withdraw"
3. Select bank account
4. Enter amount
5. Submit request
6. Admin processes within 2-3 days
```

### **LawGPT: Ask Legal Questions**
```
1. Go to /lawgpt
2. Type your legal question
3. Click send
4. Session auto-saves to Supabase
5. Access history from sidebar
6. Continue previous conversations
```

### **Messaging: Chat with Lawyer/Client**
```
1. Go to /messages (or dashboard messages)
2. Select a consultation
3. Type message and send
4. Other party sees it instantly (real-time)
5. Unread counts update automatically
6. All messages persist in Supabase
```

---

## 🗄️ Database Quick Reference

### Check Wallet Balance
```sql
SELECT * FROM wallet_balances 
WHERE user_id = 'user-uuid';
```

### View Transactions
```sql
SELECT * FROM transactions 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC;
```

### View Chat Sessions
```sql
SELECT * FROM lawgpt_sessions 
WHERE user_id = 'user-uuid' 
ORDER BY updated_at DESC;
```

### View Messages
```sql
SELECT * FROM messages 
WHERE consultation_id = 'consultation-uuid' 
ORDER BY created_at ASC;
```

---

## 🔍 Troubleshooting

### Wallet not loading?
**Check:**
1. User is authenticated (Supabase session)
2. User type is correct (client/lawyer)
3. `wallet_balances` table exists
4. Row-level security policies allow access

**Fix:**
```typescript
// In browser console:
const { getCurrentUser } = await import('@/lib/supabase');
const user = await getCurrentUser();
console.log(user); // Should show user object
```

### Transactions not showing?
**Check:**
1. `transactions` table has data
2. User ID matches
3. No errors in browser console

**Query:**
```sql
SELECT COUNT(*) FROM transactions 
WHERE user_id = 'your-user-id';
```

### LawGPT sessions not saving?
**Check:**
1. User is authenticated
2. `lawgpt_sessions` table exists
3. Check browser console for errors

**Test:**
```typescript
// In browser console:
const { createLawGPTSession } = await import('@/lib/supabase');
const result = await createLawGPTSession('user-id', 'Test');
console.log(result); // Should succeed
```

### Messages not real-time?
**Check:**
1. Supabase realtime is enabled
2. Subscription is active
3. Both users are online

**Verify:**
```typescript
// In browser console:
const { subscribeToMessages } = await import('@/lib/supabase');
const sub = subscribeToMessages('consultation-id', (payload) => {
  console.log('New message:', payload);
});
// Should log new messages
```

### Paytm payment not working?
**Check:**
1. Merchant credentials are correct
2. Environment variables are set
3. Paytm SDK is installed
4. Using correct environment (staging/production)

**Test:**
```bash
# Check if paytmchecksum is installed
npm list paytmchecksum

# Check environment variables
echo $PAYTM_MERCHANT_ID
```

---

## 🚨 Common Errors & Solutions

### Error: "Cannot read property 'id' of null"
**Cause**: User not authenticated
**Solution**: Redirect to login page
```typescript
if (!user) {
  window.location.href = '/login';
  return;
}
```

### Error: "Row level security policy violation"
**Cause**: Supabase RLS blocking access
**Solution**: Update policies in Supabase dashboard
```sql
-- Example policy for wallet_balances
CREATE POLICY "Users can view own wallet"
ON wallet_balances FOR SELECT
USING (auth.uid() = user_id);
```

### Error: "Invalid checksum"
**Cause**: Paytm checksum mismatch
**Solution**: Ensure merchant key is correct
```typescript
// Verify in callback route
const isValid = PaytmChecksum.verifySignature(
  body,
  process.env.PAYTM_MERCHANT_KEY,
  body.CHECKSUMHASH
);
```

### Error: "Transaction not found"
**Cause**: Order ID mismatch
**Solution**: Check order ID format
```typescript
// Order ID format: ORDER_timestamp_userId
const orderId = `ORDER_${Date.now()}_${userId.substring(0, 8)}`;
```

---

## 📊 Monitoring Checklist

### Daily Checks
- [ ] Wallet balances are updating correctly
- [ ] Transactions are being recorded
- [ ] Messages are delivering in real-time
- [ ] LawGPT sessions are saving
- [ ] No errors in Supabase logs

### Weekly Checks
- [ ] Payment success rate > 95%
- [ ] Average message delivery < 500ms
- [ ] Wallet sync issues: 0
- [ ] Failed transactions follow-up

### Monthly Checks
- [ ] Database growth trends
- [ ] Paytm reconciliation
- [ ] User feedback on messaging
- [ ] LawGPT usage analytics

---

## 🎓 Learning Resources

### Supabase
- **Real-time**: https://supabase.com/docs/guides/realtime
- **Auth**: https://supabase.com/docs/guides/auth
- **Database**: https://supabase.com/docs/guides/database

### Paytm
- **Integration Guide**: https://developer.paytm.com/docs/payment-gateway/
- **Testing**: Use test credentials from merchant dashboard
- **Support**: support@paytm.com

### Next.js
- **API Routes**: https://nextjs.org/docs/api-routes/introduction
- **App Router**: https://nextjs.org/docs/app

---

## 📞 Quick Contact

### For Bugs
1. Check browser console
2. Check Supabase logs
3. Check server logs
4. Report with full error stack

### For Features
1. Reference this guide
2. Check Supabase docs
3. Check implementation in code
4. Test in development first

### For Paytm Issues
- Merchant Dashboard: https://dashboard.paytm.com/
- Developer Portal: https://developer.paytm.com/
- Support: support@paytm.com, 0120-4888-888

---

## ✅ Final Checklist

Before going live:
- [ ] Paytm merchant account verified (production)
- [ ] Environment variables set (production)
- [ ] Database policies configured
- [ ] All tests passing
- [ ] Error monitoring enabled
- [ ] Backup strategy in place
- [ ] SSL certificates configured
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] User acceptance testing complete

---

**Last Updated**: {{ current_date }}
**Version**: 1.0.0
**Status**: ✅ Ready for Production (after Paytm setup)
