"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithPhoneOTP, verifyPhoneOTP } from '@/lib/supabase-auth';
import { useNotification } from '@/contexts/notification-context';

interface PhoneOTPInputProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PhoneOTPInput({ onSuccess, onError }: PhoneOTPInputProps) {
  const { showNotification } = useNotification();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Add + prefix for international format
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    return cleaned;
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      onError?.('Please enter a valid phone number');
      return;
    }

    try {
      setIsSending(true);
      const formattedPhone = formatPhoneNumber(phone);
      await signInWithPhoneOTP(formattedPhone);
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

      showNotification('OTP sent successfully! Check your phone.', 'success');
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
      onError?.('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsVerifying(true);
      const formattedPhone = formatPhoneNumber(phone);
      const result = await verifyPhoneOTP(formattedPhone, otp);
      
      if (result.session) {
        onSuccess?.();
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
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSending}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Enter phone number with country code (e.g., +91 for India)
            </p>
          </div>
          <Button
            onClick={handleSendOTP}
            disabled={isSending || !phone}
            className="w-full"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium text-foreground">
              Enter OTP
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isVerifying}
              maxLength={6}
              className="bg-background text-center text-2xl tracking-widest font-mono"
            />
            <p className="text-xs text-muted-foreground">
              OTP sent to {phone}
            </p>
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
              'Verify OTP'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0}
              className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOTPSent(false);
              setOtp('');
              setCountdown(0);
            }}
            className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
          >
            Change phone number
          </button>
        </>
      )}
    </div>
  );
}
