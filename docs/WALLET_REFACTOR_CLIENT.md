# Client Wallet Refactor - Complete

## Summary
Successfully refactored `/frontend/src/app/dashboard/client/wallet/page.tsx` to remove all mock data and Razorpay code, replacing it with Supabase integration and Paytm merchant payment gateway.

## Changes Made

### 1. **Removed Mock Data**
   - Eliminated all hardcoded wallet balance and transaction data
   - Removed mock transaction history
   - Connected to real Supabase database for all wallet operations

### 2. **Supabase Integration**
   - **Authentication**: Uses `getCurrentUser()` to verify user session
   - **User Profile**: Fetches real user profile with `getUserProfile()`
   - **Wallet Balance**: Retrieves wallet data from `wallet_balances` table
   - **Transactions**: Fetches all user transactions from `transactions` table
   - **Real-time Updates**: All wallet operations update Supabase immediately

### 3. **Removed Razorpay Code**
   - ❌ Removed Razorpay script loading
   - ❌ Removed `window.Razorpay` initialization
   - ❌ Removed `razorpayPaymentId` field references
   - ❌ Removed all Razorpay-specific payment handling
   - ❌ Updated UI text from "Razorpay" to "Paytm"

### 4. **Added Paytm Integration**
   - ✅ Created `/api/paytm/initiate-payment` endpoint
   - ✅ Created `/api/paytm/callback` endpoint
   - ✅ Updated transaction interface to use `paytmOrderId` and `paytmTransactionId`
   - ✅ Payment flow now calls Paytm merchant API
   - ✅ Added stub implementation with TODO comments for full Paytm integration

### 5. **Updated Payment Flow**

#### **Add Money Flow**
```typescript
1. User enters amount
2. Validates amount (₹100 - ₹100,000)
3. Calls /api/paytm/initiate-payment
4. Creates pending transaction in Supabase
5. Redirects to Paytm payment page (or simulates in test mode)
6. On success callback, updates transaction status
7. Updates wallet balance in Supabase
```

#### **Withdrawal Flow**
```typescript
1. User enters withdrawal amount
2. Validates amount (min ₹500, max current balance)
3. Creates pending withdrawal transaction in Supabase
4. Updates wallet balance (deducts from available, adds to pending)
5. Admin processes withdrawal within 2-3 business days
```

### 6. **Data Structure**

#### Transaction Interface
```typescript
interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  category: string;
  paymentMethod?: string;
  paytmOrderId?: string;      // Paytm Order ID
  paytmTransactionId?: string; // Paytm Transaction ID
}
```

#### Wallet Data
```typescript
interface WalletData {
  balance: number;          // Available balance
  totalEarnings: number;    // All-time earnings
  totalSpent: number;       // All-time spending
  pendingAmount: number;    // Amount being processed
}
```

## API Routes Created

### 1. `/api/paytm/initiate-payment` (POST)
**Purpose**: Initiates a Paytm payment transaction

**Request Body**:
```json
{
  "userId": "user-uuid",
  "amount": 1000,
  "email": "user@example.com",
  "phone": "+919876543210",
  "orderType": "WALLET_TOPUP"
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "ORDER_1234567890_abcdef12",
  "txnToken": "token123...",
  "paymentUrl": "https://securegw.paytm.in/..."
}
```

**TODO**: 
- Add Paytm merchant credentials
- Implement checksum generation
- Call actual Paytm initiate transaction API

### 2. `/api/paytm/callback` (POST/GET)
**Purpose**: Handles callback from Paytm after payment

**Functionality**:
- Verifies Paytm checksum
- Updates transaction status in database
- Updates wallet balance on success
- Redirects user to wallet page with status

**TODO**:
- Implement checksum verification
- Add proper error handling
- Set up webhook security

## Environment Variables Needed

Add these to `.env.local`:

```env
# Paytm Merchant Configuration
PAYTM_MERCHANT_ID=your_merchant_id
PAYTM_MERCHANT_KEY=your_merchant_key
PAYTM_WEBSITE=WEBSTAGING  # or DEFAULT for production
PAYTM_INDUSTRY_TYPE=Retail
PAYTM_CHANNEL_ID=WEB
PAYTM_CALLBACK_URL=https://yourdomain.com/api/paytm/callback

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema (Supabase)

### `wallet_balances` Table
```sql
CREATE TABLE wallet_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  pending_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `transactions` Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('success', 'pending', 'failed')),
  payment_method TEXT,
  razorpay_payment_id TEXT,  -- Reused for paytmTransactionId
  razorpay_order_id TEXT,    -- Reused for paytmOrderId
  consultation_id UUID REFERENCES consultations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Checklist

### Before Production:
- [ ] Set up Paytm merchant account
- [ ] Add Paytm merchant credentials to environment variables
- [ ] Install Paytm SDK: `npm install paytmchecksum`
- [ ] Test payment flow in Paytm staging environment
- [ ] Implement proper checksum generation and verification
- [ ] Test callback handling with real Paytm responses
- [ ] Add error handling and retry logic
- [ ] Set up proper logging for payment failures
- [ ] Test withdrawal flow end-to-end
- [ ] Verify wallet balance updates correctly
- [ ] Test transaction history filtering
- [ ] Ensure proper access control (clients only)

### Security Considerations:
- [ ] Never expose Paytm merchant key in client-side code
- [ ] Always verify checksums on callback
- [ ] Use HTTPS for all payment-related endpoints
- [ ] Implement rate limiting on payment initiation
- [ ] Add CSRF protection
- [ ] Log all payment attempts for audit trail
- [ ] Implement idempotency for transaction creation

## Next Steps

1. **Complete Paytm Integration**:
   - Install Paytm SDK
   - Implement checksum generation in `/api/paytm/initiate-payment`
   - Implement checksum verification in `/api/paytm/callback`
   - Test with Paytm staging environment

2. **Enhance Features**:
   - Add transaction receipt download
   - Implement email notifications for transactions
   - Add transaction export functionality
   - Create admin panel for processing withdrawals

3. **Continue Refactoring**:
   - Refactor lawyer wallet page (similar changes)
   - Update LawGPT page for Supabase integration
   - Update messages context for real-time chat

## Files Modified

1. ✅ `/frontend/src/app/dashboard/client/wallet/page.tsx` - Complete refactor
2. ✅ `/frontend/src/app/api/paytm/initiate-payment/route.ts` - New API endpoint
3. ✅ `/frontend/src/app/api/paytm/callback/route.ts` - New API endpoint

## Files to Refactor Next

1. ⏳ `/frontend/src/app/dashboard/lawyer/wallet/page.tsx` - Lawyer wallet
2. ⏳ `/frontend/src/app/lawgpt/page.tsx` - LawGPT chat persistence
3. ⏳ `/frontend/src/lib/messages-context.tsx` - Real-time messaging

---

**Status**: ✅ Client Wallet Refactor Complete
**Ready for Testing**: Yes (with Paytm merchant credentials)
**Production Ready**: No (requires Paytm merchant setup)
