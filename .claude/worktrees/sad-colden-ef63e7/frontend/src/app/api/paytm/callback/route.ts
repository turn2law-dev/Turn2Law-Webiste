import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Paytm Payment Callback API
 * 
 * This endpoint handles the callback from Paytm after payment is processed.
 * It verifies the payment status and updates the transaction in the database.
 * 
 * TODO: Implement actual Paytm checksum verification
 */

// Helper function to get Supabase client (lazy initialization)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, txnId, status, amount, userId } = body;

    // TODO: Verify Paytm checksum to ensure the callback is authentic
    /*
    const PaytmChecksum = require('paytmchecksum');
    const isValidChecksum = PaytmChecksum.verifySignature(
      body,
      process.env.PAYTM_MERCHANT_KEY,
      body.CHECKSUMHASH
    );

    if (!isValidChecksum) {
      return NextResponse.json(
        { error: 'Invalid checksum' },
        { status: 400 }
      );
    }
    */

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Get the pending transaction from database
    const { data: existingTxn, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (fetchError || !existingTxn) {
      console.error('Transaction not found:', orderId);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction status
    const txnStatus = status === 'TXN_SUCCESS' ? 'success' : 'failed';
    
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: txnStatus,
        razorpay_payment_id: txnId, // Using this field for Paytm transaction ID
        updated_at: new Date().toISOString()
      })
      .eq('id', existingTxn.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      throw updateError;
    }

    // If payment was successful, update wallet balance
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
      } else {
        // Create wallet if it doesn't exist
        await supabase
          .from('wallet_balances')
          .insert({
            user_id: existingTxn.user_id,
            balance: existingTxn.amount,
            total_earnings: existingTxn.amount,
            total_spent: 0,
            pending_amount: 0
          });
      }
    }

    // Redirect user to appropriate page
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

// Handle GET requests (Paytm sometimes uses GET for callbacks)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('ORDER_ID');
  
  if (!orderId) {
    return NextResponse.redirect('/dashboard/client/wallet?payment=error');
  }

  // In a real implementation, you would verify the transaction status with Paytm
  // and then redirect appropriately
  return NextResponse.redirect(`/dashboard/client/wallet?order=${orderId}`);
}
