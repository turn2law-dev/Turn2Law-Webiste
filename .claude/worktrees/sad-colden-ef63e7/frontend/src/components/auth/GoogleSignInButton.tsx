"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/supabase-auth';
import { useNotification } from '@/contexts/notification-context';

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
  className?: string;
}

export default function GoogleSignInButton({ mode = 'signin', className = '' }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // Redirect handled by Supabase
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      showNotification(error.message || 'Failed to sign in with Google. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.8055 10.2292C19.8055 9.55056 19.7501 8.86681 19.6306 8.19873H10.2002V12.0492H15.6015C15.3774 13.2911 14.6572 14.3898 13.6029 15.0879V17.5866H16.8251C18.7175 15.8449 19.8055 13.2728 19.8055 10.2292Z" fill="#4285F4"/>
            <path d="M10.2 19.9998C12.9595 19.9998 15.2721 19.1046 16.8291 17.5865L13.6069 15.0879C12.7078 15.6978 11.5519 16.0527 10.2041 16.0527C7.53481 16.0527 5.28071 14.2909 4.48822 11.9087H1.16602V14.4818C2.75519 17.6441 6.31741 19.9998 10.2 19.9998Z" fill="#34A853"/>
            <path d="M4.48407 11.9089C4.04492 10.667 4.04492 9.33723 4.48407 8.09534V5.52222H1.16601C-0.384706 8.59717 -0.384706 12.407 1.16601 15.482L4.48407 11.9089Z" fill="#FBBC04"/>
            <path d="M10.2 3.94755C11.6246 3.92571 13.0015 4.47139 14.0361 5.45944L16.8918 2.60379C15.1836 0.99337 12.9298 0.0993359 10.2 0.125466C6.31741 0.125466 2.75519 2.48123 1.16602 5.64769L4.48407 8.22082C5.2724 5.83448 7.53066 3.94755 10.2 3.94755Z" fill="#EA4335"/>
          </svg>
          <span>{mode === 'signin' ? 'Sign in' : 'Sign up'} with Google</span>
        </>
      )}
    </Button>
  );
}
