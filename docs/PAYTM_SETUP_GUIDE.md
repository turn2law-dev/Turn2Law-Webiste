# Paytm Merchant Integration Guide

This guide will help you set up Paytm payment gateway for the Turn2Law wallet system.

## Prerequisites

1. **Paytm Merchant Account**
   - Sign up at: https://business.paytm.com/
   - Complete KYC verification
   - Get your merchant credentials

2. **Required Credentials**
   - Merchant ID (MID)
   - Merchant Key
   - Website Name
   - Industry Type
   - Channel ID

## Step 1: Install Paytm SDK

```bash
cd frontend
npm install paytmchecksum
```

## Step 2: Configure Environment Variables

Add these to `frontend/.env.local`:

```env
# Paytm Merchant Configuration
PAYTM_MERCHANT_ID=YOUR_MERCHANT_ID
PAYTM_MERCHANT_KEY=YOUR_MERCHANT_KEY
PAYTM_WEBSITE=WEBSTAGING
PAYTM_INDUSTRY_TYPE=Retail
PAYTM_CHANNEL_ID=WEB
PAYTM_CALLBACK_URL=http://localhost:3000/api/paytm/callback

# For Production
# PAYTM_WEBSITE=DEFAULT
# PAYTM_CALLBACK_URL=https://yourdomain.com/api/paytm/callback
```

## Step 3: Update API Routes

### Update `/api/paytm/initiate-payment/route.ts`

Uncomment and complete the Paytm integration code:

```typescript
import { NextRequest, NextResponse } from 'next/server';
const PaytmChecksum = require('paytmchecksum');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, email, phone, orderType } = body;

    if (!userId || !amount || amount < 100) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const orderId = `ORDER_${Date.now()}_${userId.substring(0, 8)}`;

    const paytmParams = {
      body: {
        requestType: "Payment",
        mid: process.env.PAYTM_MERCHANT_ID,
        websiteName: process.env.PAYTM_WEBSITE,
        orderId: orderId,
        callbackUrl: `${process.env.PAYTM_CALLBACK_URL}?ORDER_ID=${orderId}`,
        txnAmount: {
          value: amount.toString(),
          currency: "INR",
        },
        userInfo: {
          custId: userId,
          email: email || '',
          mobile: phone || ''
        },
      },
    };

    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      process.env.PAYTM_MERCHANT_KEY
    );

    paytmParams.head = {
      signature: checksum,
    };

    const env = process.env.PAYTM_WEBSITE === 'DEFAULT' ? '' : '-stage';
    const response = await fetch(
      `https://securegw${env}.paytm.in/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MERCHANT_ID}&orderId=${orderId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paytmParams),
      }
    );

    const result = await response.json();
    
    if (result.body.resultInfo.resultStatus === 'S') {
      const paymentUrl = `https://securegw${env}.paytm.in/theia/api/v1/showPaymentPage?mid=${process.env.PAYTM_MERCHANT_ID}&orderId=${orderId}`;
      
      return NextResponse.json({
        success: true,
        orderId: orderId,
        txnToken: result.body.txnToken,
        paymentUrl: paymentUrl
      });
    } else {
      throw new Error(result.body.resultInfo.resultMsg);
    }
  } catch (error) {
    console.error('Paytm payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
```

### Update `/api/paytm/callback/route.ts`

Add checksum verification:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const PaytmChecksum = require('paytmchecksum');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify checksum
    const isValidChecksum = PaytmChecksum.verifySignature(
      body,
      process.env.PAYTM_MERCHANT_KEY,
      body.CHECKSUMHASH
    );

    if (!isValidChecksum) {
      console.error('Invalid checksum received');
      return NextResponse.json(
        { error: 'Invalid checksum' },
        { status: 400 }
      );
    }

    const orderId = body.ORDERID;
    const txnId = body.TXNID;
    const status = body.STATUS;

    // Get pending transaction
    const { data: existingTxn, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (fetchError || !existingTxn) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const txnStatus = status === 'TXN_SUCCESS' ? 'success' : 'failed';
    
    // Update transaction
    await supabase
      .from('transactions')
      .update({
        status: txnStatus,
        razorpay_payment_id: txnId,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingTxn.id);

    // Update wallet on success
    if (txnStatus === 'success') {
      const { data: wallet } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', existingTxn.user_id)
        .single();

      if (wallet) {
        await supabase
          .from('wallet_balances')
          .update({
            balance: wallet.balance + existingTxn.amount,
            total_earnings: wallet.total_earnings + existingTxn.amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', existingTxn.user_id);
      }
    }

    const redirectUrl = txnStatus === 'success'
      ? `/dashboard/client/wallet?payment=success&amount=${existingTxn.amount}`
      : `/dashboard/client/wallet?payment=failed`;

    return NextResponse.json({
      success: txnStatus === 'success',
      redirectUrl
    });

  } catch (error) {
    console.error('Paytm callback error:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}
```

## Step 4: Testing

### Staging Environment

1. **Test Credentials**: Paytm provides test merchant credentials
2. **Test Cards**: Use Paytm test cards for staging
   - Card Number: 4111111111111111
   - CVV: 123
   - Expiry: Any future date

3. **Test Flow**:
   ```bash
   # Start your dev server
   npm run dev
   
   # Navigate to
   http://localhost:3000/dashboard/client/wallet
   
   # Try adding money
   # Use test credentials
   ```

### Production Checklist

- [ ] Get production merchant credentials
- [ ] Update environment variables
- [ ] Test with real payment methods
- [ ] Set up monitoring and alerts
- [ ] Configure webhook IP whitelisting
- [ ] Set up reconciliation process

## Step 5: Security Best Practices

1. **Never expose merchant key in client-side code**
2. **Always verify checksums on callbacks**
3. **Use HTTPS in production**
4. **Implement rate limiting**
5. **Log all transactions for audit**
6. **Set up alerts for failed payments**
7. **Implement proper error handling**

## Paytm API Documentation

- **Main Docs**: https://developer.paytm.com/docs/
- **Payment Gateway**: https://developer.paytm.com/docs/payment-gateway/
- **API Reference**: https://developer.paytm.com/docs/api/

## Support

For Paytm integration issues:
- Email: support@paytm.com
- Phone: 0120-4888-888
- Developer Portal: https://developer.paytm.com/

## Troubleshooting

### Common Issues

1. **"Invalid Checksum" Error**
   - Verify merchant key is correct
   - Ensure you're using the right environment (staging/production)
   - Check if all required parameters are being sent

2. **"Transaction Not Found" Error**
   - Ensure transaction is being created before Paytm redirect
   - Check database connection
   - Verify order ID matches

3. **Payment Page Not Loading**
   - Check if merchant ID is correct
   - Verify website name is correct
   - Ensure callback URL is accessible

4. **Callback Not Received**
   - Check if callback URL is publicly accessible
   - Verify firewall settings
   - Check server logs for errors

## Alternative: Use Paytm SDK

If you prefer to use Paytm's JavaScript SDK for a more integrated experience:

```html
<!-- Add to your page -->
<script src="https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/YOUR_MID.js"></script>

<script>
function initiatePayment() {
  var config = {
    "root": "",
    "flow": "DEFAULT",
    "data": {
      "orderId": "ORDER_ID",
      "token": "TXN_TOKEN",
      "tokenType": "TXN_TOKEN",
      "amount": "1000"
    },
    "handler": {
      "notifyMerchant": function(eventName, data) {
        console.log("notifyMerchant handler function called");
        console.log("eventName => ", eventName);
        console.log("data => ", data);
      }
    }
  };

  if (window.Paytm && window.Paytm.CheckoutJS) {
    window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
      window.Paytm.CheckoutJS.invoke();
    }).catch(function onError(error) {
      console.log("error => ", error);
    });
  }
}
</script>
```

---

**Note**: This integration is for merchant payment gateway. If you want to integrate Paytm Wallet separately, you'll need additional Paytm Wallet API integration.
