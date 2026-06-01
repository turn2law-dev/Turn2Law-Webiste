"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { resendVerificationEmail, getCurrentAuthUser, isEmailVerified } from '@/lib/supabase-auth';
import Link from 'next/link';
import { useNotification } from '@/contexts/notification-context';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    checkEmailVerification();
  }, []);

  const checkEmailVerification = async () => {
    try {
      setIsChecking(true);
      const user = await getCurrentAuthUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email || '');

      // Check if already verified
      const verified = await isEmailVerified();
      if (verified) {
        router.push('/');
        return;
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    try {
      setIsResending(true);
      await resendVerificationEmail();
      setEmailSent(true);
      setCountdown(60);

      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      showNotification('Verification email sent! Please check your inbox.', 'success');
    } catch (error: any) {
      console.error('Resend email error:', error);
      showNotification(error.message || 'Failed to resend verification email', 'error');
    } finally {
      setIsResending(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <svg
            width="48"
            height="60"
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

        {/* Main Content */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-lg">
          {/* Email Icon */}
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Verify Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a verification link to
            </p>
            <p className="font-semibold text-foreground">{email}</p>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What's next?
            </h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Check your email inbox for our verification email</li>
              <li>Click the verification link in the email</li>
              <li>You'll be automatically redirected back to Turn2Law</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || countdown > 0}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend Email (${countdown}s)`
              ) : (
                'Resend Verification Email'
              )}
            </Button>

            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              I've Verified My Email
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder.
            </p>
            <Link
              href="/login"
              className="text-sm text-primary hover:underline block"
            >
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground">
          Email verification helps us keep your account secure
        </p>
      </div>
    </div>
  );
}
