"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getUserProfile } from '@/lib/supabase-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'client' | 'lawyer';
  redirectTo?: string;
}

/**
 * AuthGuard component to protect routes that require authentication
 * Checks for valid Supabase session and optionally validates user type
 */
export function AuthGuard({ 
  children, 
  requiredUserType, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[AuthGuard] Checking authentication...');
      
      // Check for valid session
      const session = await getSession();
      
      if (!session || !session.user) {
        console.log('[AuthGuard] No session found, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }

      console.log('[AuthGuard] Session valid, user ID:', session.user.id);

      // If user type is required, fetch profile and check
      if (requiredUserType) {
        const profile = await getUserProfile(session.user.id);
        
        if (!profile) {
          console.error('[AuthGuard] Profile not found');
          router.push(redirectTo);
          return;
        }

        if (profile.user_type !== requiredUserType) {
          console.log('[AuthGuard] User type mismatch. Required:', requiredUserType, 'Got:', profile.user_type);
          
          // Redirect to appropriate dashboard
          const dashboardPath = profile.user_type === 'lawyer' ? '/dashboard/lawyer' : '/dashboard/client';
          router.push(dashboardPath);
          return;
        }
      }

      console.log('[AuthGuard] Authorization successful');
      setIsAuthorized(true);
      
    } catch (error) {
      console.error('[AuthGuard] Error checking auth:', error);
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
