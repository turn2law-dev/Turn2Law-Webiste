"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/contexts/notification-context';

interface EmailOTPInputProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function EmailOTPInput({ onSuccess, onError }: EmailOTPInputProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    try {
      setIsSending(true);
      
      // Send OTP to email using Supabase
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true, // Creates account if doesn't exist
        }
      });

      if (error) throw error;

      setIsOTPSent(true);
      setCountdown(60);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      showNotification('OTP sent successfully! Check your email inbox.', 'success');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      onError?.(error.message || 'Failed to send OTP');
      showNotification(error.message || 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      showNotification('Please enter the 6-digit code', 'error');
      return;
    }

    try {
      setIsVerifying(true);
      
      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      if (data.session && data.user) {
        console.log('✅ Email OTP verification successful');
        
        // Check if profile exists, if not create it
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile) {
          // Create profile for new user
          await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.email?.split('@')[0] || 'User',
              user_type: 'client',
              email_verified: true,
            }]);
        }

        showNotification('Login successful!', 'success');
        
        // Add 2-second delay before redirect and callback
        setTimeout(() => {
          if (profile?.user_type === 'lawyer') {
            router.push('/dashboard/lawyer');
          } else {
            router.push('/dashboard/client');
          }
          onSuccess?.();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      onError?.(error.message || 'Invalid OTP');
      showNotification(error.message || 'Invalid OTP. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setOtp('');
    await handleSendOTP();
  };

  return (
    <div className="space-y-4">
      {!isOTPSent ? (
        <>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              className="bg-background"
              autoComplete="email"
            />
            <p className="text-xs text-muted-foreground">
              We'll send a 6-digit code to your email
            </p>
          </div>
          <Button
            onClick={handleSendOTP}
            disabled={isSending || !email}
            className="w-full"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Code...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Code to Email
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-foreground">Code sent to {email}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Check your inbox and enter the 6-digit code below
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium text-foreground">
              Enter 6-Digit Code
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isVerifying}
              maxLength={6}
              className="bg-background text-center text-2xl tracking-[0.5em] font-mono"
              autoComplete="one-time-code"
            />
          </div>

          <Button
            onClick={handleVerifyOTP}
            disabled={isVerifying || otp.length !== 6}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verify & Login
              </>
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0}
              className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOTPSent(false);
                setOtp('');
                setCountdown(0);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Change Email
            </button>
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Passwordless Login</p>
            <p>No password needed! Just enter your email and verify with the code.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
