"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get params from window.location instead of useSearchParams to avoid SSR issues
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        const error_description = params.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(error_description || 'Authentication failed');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (code) {
          // Exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('[Auth Callback] Error exchanging code:', exchangeError);
            setStatus('error');
            setMessage('Failed to complete authentication');
            setTimeout(() => router.push('/login'), 3000);
            return;
          }

          if (data.session) {
            console.log('[Auth Callback] Authentication successful');
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
            
            // Check if user profile exists, if not create it
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (!profile && data.user) {
              // Create profile for OAuth user
              const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                  id: data.user.id,
                  email: data.user.email,
                  full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User',
                  user_type: 'client', // Default to client
                  email_verified: data.user.email_confirmed_at != null,
                  profile_image_url: data.user.user_metadata?.avatar_url || null,
                }]);

              if (profileError) {
                console.error('[Auth Callback] Error creating profile:', profileError);
              }
            }

            // Redirect to homepage or intended destination
            const redirectTo = params.get('redirect') || '/';
            setTimeout(() => router.push(redirectTo), 1500);
          }
        } else {
          // Handle magic link or email verification
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError || !session) {
            setStatus('error');
            setMessage('No valid session found');
            setTimeout(() => router.push('/login'), 3000);
            return;
          }

          setStatus('success');
          setMessage('Email verified successfully!');
          setTimeout(() => router.push('/'), 1500);
        }
      } catch (error) {
        console.error('[Auth Callback] Unexpected error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      handleAuthCallback();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <svg
            width="64"
            height="80"
            viewBox="0 0 62 79"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path
              d="M46.3782 0L30.7564 16.3146L36.1293 21.5024L42.6514 14.691V53.3941L6.77247 17.715C4.26262 15.2191 0 17.0044 0 20.5514V79H7.45364V28.9262L43.3326 64.6053C45.8423 67.1011 50.105 65.316 50.105 61.7689V14.691L56.6272 21.5024L62 16.3146L46.3782 0Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Status Message */}
        <div className="space-y-4">
          {status === 'loading' && (
            <>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{message}</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <svg
                  className="h-16 w-16 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600">{message}</h2>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <svg
                  className="h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600">Authentication Failed</h2>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {status === 'loading' && 'Please wait...'}
          {status === 'success' && 'You will be redirected shortly.'}
          {status === 'error' && 'Redirecting to login page...'}
        </p>
      </div>
    </div>
  );
}
