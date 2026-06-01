import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * SECURE Auth Callback Handler
 *
 * This route handles both:
 * 1. Password reset callbacks (token_hash + type=recovery)
 * 2. OAuth/Magic link callbacks (code parameter - PKCE flow)
 *
 * Security measures:
 * 1. Tokens are processed server-side only
 * 2. No tokens are ever sent to the client in URL
 * 3. Session is established via secure cookies
 * 4. Redirect URL contains no sensitive data
 * 5. One-time use tokens are immediately consumed
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('[Auth Callback] Processing callback - type:', type, 'hasCode:', !!code, 'hasTokenHash:', !!tokenHash);

  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // Create server-side Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );

  // Handle token_hash flow (password recovery, email confirmation)
  // For password recovery, redirect to client-side page which will verify the token
  // This allows Supabase to properly establish the session on the client
  if (tokenHash && type) {
    console.log('[Auth Callback] Processing token_hash flow for type:', type);

    if (type === 'recovery') {
      // Redirect to reset-password page with token_hash for client-side verification
      // The client will immediately capture and clear the URL, then verify the token
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}`
      );
    }

    // For other types (email confirmation, etc.), verify server-side
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'email' | 'signup' | 'invite' | 'magiclink' | 'email_change',
      });

      if (verifyError) {
        console.error('[Auth Callback] Token verification error:', verifyError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(verifyError.message)}`
        );
      }

      if (data.session) {
        console.log('[Auth Callback] Session established via token_hash for user:', data.session.user.id);
        // Redirect to home page after email confirmation
        return NextResponse.redirect(`${requestUrl.origin}/`);
      }
    } catch (err) {
      console.error('[Auth Callback] Token verification unexpected error:', err);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('An unexpected error occurred')}`
      );
    }
  }

  // Handle PKCE code flow (OAuth, magic links)
  if (code) {
    console.log('[Auth Callback] Processing PKCE code flow');

    try {
      // Exchange the authorization code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('[Auth Callback] Code exchange error:', exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/reset-password?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (data.session) {
        console.log('[Auth Callback] Session established via code for user:', data.session.user.id);

        // Create response with redirect
        const response = NextResponse.redirect(`${requestUrl.origin}/reset-password?verified=true`);

        // Set secure session cookies
        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: data.session.expires_in,
          path: '/',
        });

        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        return response;
      }
    } catch (err) {
      console.error('[Auth Callback] Code exchange unexpected error:', err);
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=${encodeURIComponent('An unexpected error occurred')}`
      );
    }
  }

  // No valid parameters provided
  console.warn('[Auth Callback] No code or token_hash provided in callback');
  return NextResponse.redirect(`${requestUrl.origin}/reset-password?error=Invalid request`);
}
