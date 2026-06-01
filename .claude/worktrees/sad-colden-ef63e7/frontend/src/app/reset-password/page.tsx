"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ValidatedInput } from '@/components/ui/validated-input';
import { updatePassword, resetPasswordRequest, verifyPasswordResetOtp } from '@/lib/supabase-auth';
import Link from 'next/link';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationState, setValidationState] = useState({
    password: false,
  });

  // Refs for OTP inputs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check for email in URL (from Settings page redirect)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setStep('otp'); // Skip to OTP step since code was already sent
      // Clear URL
      window.history.replaceState(null, '', '/reset-password');
    }
  }, []);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otpCode];
    newOtp[index] = digit;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otpCode];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtpCode(newOtp);

    // Focus the next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    otpRefs.current[focusIndex]?.focus();
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      await resetPasswordRequest(email);
      setStep('otp');
    } catch (error: any) {
      console.error('OTP request error:', error);
      if (error.message?.includes('User not found') || error.message?.includes('no user')) {
        setError('No account found with this email address');
      } else {
        setError(error.message || 'Failed to send verification code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      await verifyPasswordResetOtp(email, code);
      setStep('password');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validationState.password) {
      setError('Please enter a valid password that meets all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setStep('success');

      // Redirect after delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Password update error:', error);
      setError(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    try {
      setIsLoading(true);
      await resetPasswordRequest(email);
      setOtpCode(['', '', '', '', '', '']);
      setError(''); // Clear any previous errors
    } catch (error: any) {
      setError(error.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Success Screen
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Password Changed!</h2>
          <p className="text-muted-foreground">
            Your password has been successfully updated.
            <br />
            Redirecting to login page...
          </p>
        </div>
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

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-lg">

          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
                <p className="text-muted-foreground">
                  Enter your email to receive a verification code
                </p>
              </div>

              {/* Google users notice */}
              <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Signed up with Google?</p>
                    <p className="text-muted-foreground">
                      Use "Sign in with Google" on the login page instead.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <ValidatedInput
                  type="email"
                  value={email}
                  onValueChange={(value) => setEmail(value)}
                  validationType="email"
                  placeholder="your.email@example.com"
                  label="Email Address"
                  required
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Enter Code</h1>
                <p className="text-muted-foreground">
                  We sent a 6-digit code to<br />
                  <strong className="text-foreground">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </div>
                )}

                {/* OTP Input */}
                <div className="flex justify-center gap-2">
                  {otpCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || otpCode.join('').length !== 6}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-primary"
                  >
                    Resend Code
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setStep('email'); setError(''); }}
                  className="w-full"
                >
                  Use Different Email
                </Button>
              </form>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <>
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Set New Password</h1>
                <p className="text-muted-foreground">
                  Code verified! Now create your new password.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <ValidatedInput
                  type="password"
                  value={newPassword}
                  onValueChange={(value, isValid) => {
                    setNewPassword(value);
                    setValidationState(prev => ({ ...prev, password: isValid }));
                  }}
                  validationType="password"
                  showPasswordStrength={true}
                  placeholder="Enter new password"
                  label="New Password"
                  required
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className={confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-500">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !validationState.password || newPassword !== confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </>
          )}

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
