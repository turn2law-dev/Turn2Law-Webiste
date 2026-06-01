"use client";

import { useRouter } from 'next/navigation';
import EmailOTPInput from '@/components/auth/EmailOTPInput';
import Link from 'next/link';

export default function EmailOTPLoginPage() {
  const router = useRouter();

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

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Passwordless Login</h1>
          <p className="text-muted-foreground">
            Login with just your email - no password needed!
          </p>
        </div>

        {/* OTP Input Component */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <EmailOTPInput 
            onSuccess={() => {
              console.log('Email OTP login successful');
            }}
            onError={(error) => {
              console.error('Email OTP login error:', error);
            }}
          />
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link 
              href="/login" 
              className="text-primary hover:underline"
            >
              ← Back to Login
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/signup" 
              className="text-primary hover:underline"
            >
              Create Account
            </Link>
          </div>

          {/* Benefits */}
          <div className="bg-muted/30 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm font-medium text-foreground">✨ Benefits:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ No password to remember</li>
              <li>✓ More secure than traditional passwords</li>
              <li>✓ Quick and easy access</li>
              <li>✓ Works on any device</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
