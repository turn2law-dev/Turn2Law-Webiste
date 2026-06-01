"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentAuthUser, signOut } from '@/lib/supabase-auth';
import Link from 'next/link';
import { useNotification } from '@/contexts/notification-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EmailOTPVerificationPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  useEffect(() => {
    checkEmailVerification();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const checkEmailVerification = async () => {
    try {
      setIsChecking(true);
      
      // Check if email is passed via URL (from signup)
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      
      if (emailParam) {
        setEmail(emailParam);
        setIsChecking(false);
        // Auto-send OTP for new signups - send immediately with the email from URL
        sendOTPWithEmail(emailParam);
        return;
      }
      
      // Otherwise check authenticated user
      const user = await getCurrentAuthUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email || '');

      // Check if already verified
      if (user.email_confirmed_at) {
        router.push('/');
        return;
      }

      // Check if Google user
      const isGoogleUser = user.app_metadata?.provider === 'google' ||
                           user.identities?.some((id: any) => id.provider === 'google');
      
      if (isGoogleUser) {
        // Google users don't need email verification
        router.push('/');
        return;
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const sendOTPWithEmail = async (emailToSend: string) => {
    try {
      setIsSendingOTP(true);
      setError('');

      const response = await fetch(`${API_URL}/api/email-otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      showNotification('OTP sent successfully! Check your email.', 'success');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setError(error.message || 'Failed to send OTP');
      setOtpSent(true); // Still show OTP input to allow manual resend
    } finally {
      setIsSendingOTP(false);
    }
  };

  const sendOTP = async () => {
    await sendOTPWithEmail(email);
  };

  const verifyOTP = async () => {
    try {
      setIsLoading(true);
      setError('');

      const otpString = otp.join('');

      if (otpString.length !== 6) {
        setError('Please enter all 6 digits');
        return;
      }

      const response = await fetch(`${API_URL}/api/email-otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.error || 'Invalid OTP');
      }

      // Success! Redirect to home
      showNotification('Email verified successfully!', 'success');
      router.push('/');
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setError(error.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOTP = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOTP[i] = pastedData[i];
      }
    }

    setOtp(newOTP);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
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
              Enter the 6-digit code sent to
            </p>
            <p className="font-semibold text-foreground">{email}</p>
          </div>

          {!otpSent ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Click the button below to receive a verification code via email
                </p>
              </div>

              <Button
                onClick={sendOTP}
                disabled={isSendingOTP}
                className="w-full"
              >
                {isSendingOTP ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </div>
          ) : (
            <>
              {/* OTP Input */}
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      onPaste={index === 0 ? handleOTPPaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold"
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
                    <p className="text-sm text-destructive">{error}</p>
                    {attemptsRemaining < 5 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {attemptsRemaining} attempts remaining
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={verifyOTP}
                  disabled={isLoading || otp.some(d => !d)}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                <Button
                  onClick={sendOTP}
                  disabled={isSendingOTP || countdown > 0}
                  variant="outline"
                  className="w-full"
                >
                  {isSendingOTP ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend Code (${countdown}s)`
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Important
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>The code is valid for 10 minutes</li>
              <li>Check your spam folder if you don't see it</li>
              <li>Don't share this code with anyone</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-sm"
            >
              Use Different Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
