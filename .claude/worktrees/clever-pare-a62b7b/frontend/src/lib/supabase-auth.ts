import { supabase } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  userType: 'client' | 'lawyer';
  phone?: string;
  city?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up with email and password
 * Creates both an auth user and a profile in the database
 * Note: Email confirmation is handled by custom OTP system
 */
export const signUpWithEmail = async (data: SignUpData) => {
  const { email, password, fullName, userType, phone, city } = data;

  console.log('[Supabase Auth] Signing up user:', email);

  // Create auth user in Supabase WITHOUT email confirmation
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // Disable Supabase's email confirmation link
      data: {
        full_name: fullName,
        user_type: userType,
        phone: phone || null,
        city: city || null
      }
    }
  });

  if (authError) {
    console.error('[Supabase Auth] Signup error:', authError);
    throw authError;
  }

  console.log('[Supabase Auth] Signup successful:', authData.user?.id);

  // Profile will be created automatically by database trigger
  return { user: authData.user, session: authData.session };
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (data: SignInData) => {
  const { email, password } = data;

  console.log('[Supabase Auth] Signing in user:', email);

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('[Supabase Auth] Sign in error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Sign in successful:', authData.user?.id);

  return { user: authData.user, session: authData.session };
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  console.log('[Supabase Auth] Signing out');

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[Supabase Auth] Sign out error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Sign out successful');
};

/**
 * Get current session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[Supabase Auth] Get session error:', error);
    throw error;
  }

  return session;
};

/**
 * Get current user
 */
export const getCurrentAuthUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[Supabase Auth] Get user error:', error);
    throw error;
  }

  return user;
};

/**
 * Request password reset OTP
 *
 * Flow:
 * 1. User enters email
 * 2. We send a 6-digit OTP code to their email (no link!)
 * 3. User enters the code on the website
 * 4. We verify the code and establish session
 * 5. User can then set new password
 */
export const resetPasswordRequest = async (email: string) => {
  console.log('[Supabase Auth] Requesting password reset OTP for:', email);

  // Use signInWithOtp to send a 6-digit code instead of a link
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create new user if email doesn't exist
    },
  });

  if (error) {
    console.error('[Supabase Auth] Password reset OTP request error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Password reset OTP sent to email');
};

/**
 * Verify password reset OTP code
 *
 * @param email - The user's email
 * @param otpCode - The 6-digit code from email
 * @returns Session if successful
 */
export const verifyPasswordResetOtp = async (email: string, otpCode: string) => {
  console.log('[Supabase Auth] Verifying password reset OTP for:', email);

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otpCode,
    type: 'email',
  });

  if (error) {
    console.error('[Supabase Auth] OTP verification error:', error);
    throw error;
  }

  if (!data.session) {
    throw new Error('Failed to establish session');
  }

  console.log('[Supabase Auth] OTP verified successfully');
  return data.session;
};

/**
 * Update user password with additional security checks
 */
export const updatePassword = async (newPassword: string) => {
  console.log('[Supabase Auth] Updating password');

  // Validate password strength before sending to server
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error('[Supabase Auth] Update password error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Password updated successfully');
  
  // Clear any sensitive data from memory
  newPassword = '';
};

/**
 * Listen to auth state changes
 * Returns an unsubscribe function
 */
export const onAuthStateChange = (callback: (session: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log('[Supabase Auth] Auth state changed:', _event);
    callback(session);
  });

  return () => {
    console.log('[Supabase Auth] Unsubscribing from auth state changes');
    subscription.unsubscribe();
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await getSession();
    return !!session;
  } catch (error) {
    return false;
  }
};

/**
 * Get user profile from database
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

  if (error) {
    console.error('[Supabase Auth] Get profile error:', error);
    throw error;
  }

  if (!data) {
    console.error('[Supabase Auth] Profile not found for user:', userId);
    throw new Error('Profile not found. Please contact support or try signing up again.');
  }

  return data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: { full_name?: string; city?: string }) => {
  console.log('[Supabase Auth] Updating profile for:', userId, updates);

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Supabase Auth] Update profile error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Profile updated successfully');
  return data;
};

/**
 * ==========================================
 * ENHANCED AUTH METHODS - Google, OTP, Magic Link
 * ==========================================
 */

/**
 * Sign in with Google OAuth
 * Redirects to Google authentication
 */
export const signInWithGoogle = async () => {
  console.log('[Supabase Auth] Initiating Google Sign-in');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });

  if (error) {
    console.error('[Supabase Auth] Google sign-in error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Redirecting to Google...');
  return data;
};

/**
 * Sign in with Phone OTP
 * Sends OTP to phone number
 */
export const signInWithPhoneOTP = async (phone: string) => {
  console.log('[Supabase Auth] Sending OTP to:', phone);

  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms',
    }
  });

  if (error) {
    console.error('[Supabase Auth] Phone OTP error:', error);
    throw error;
  }

  console.log('[Supabase Auth] OTP sent successfully');
  return data;
};

/**
 * Verify Phone OTP
 * Verifies the OTP code sent to phone
 */
export const verifyPhoneOTP = async (phone: string, token: string) => {
  console.log('[Supabase Auth] Verifying OTP for:', phone);

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  });

  if (error) {
    console.error('[Supabase Auth] OTP verification error:', error);
    throw error;
  }

  console.log('[Supabase Auth] OTP verified successfully');
  return { user: data.user, session: data.session };
};

/**
 * Sign in with Magic Link (Passwordless)
 * Sends magic link to email
 */
export const signInWithMagicLink = async (email: string) => {
  console.log('[Supabase Auth] Sending magic link to:', email);

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  if (error) {
    console.error('[Supabase Auth] Magic link error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Magic link sent successfully');
  return data;
};

/**
 * Resend Email Verification
 * Sends verification email to current user
 */
export const resendVerificationEmail = async () => {
  console.log('[Supabase Auth] Resending verification email');

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error('No user logged in or email not found');
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  if (error) {
    console.error('[Supabase Auth] Resend verification error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Verification email resent successfully');
};

/**
 * Check if email is verified
 */
export const isEmailVerified = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email_confirmed_at != null;
};

/**
 * Check if phone is verified
 */
export const isPhoneVerified = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.phone_confirmed_at != null;
};

/**
 * Update user email
 */
export const updateEmail = async (newEmail: string) => {
  console.log('[Supabase Auth] Updating email to:', newEmail);

  const { error } = await supabase.auth.updateUser({
    email: newEmail
  });

  if (error) {
    console.error('[Supabase Auth] Update email error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Email update initiated, check new email for verification');
};

/**
 * Update user phone
 */
export const updatePhone = async (newPhone: string) => {
  console.log('[Supabase Auth] Updating phone to:', newPhone);

  const { error } = await supabase.auth.updateUser({
    phone: newPhone
  });

  if (error) {
    console.error('[Supabase Auth] Update phone error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Phone update initiated, verify with OTP');
};

/**
 * Get authentication providers used by user
 */
export const getAuthProviders = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Get app metadata which includes providers
  return user.app_metadata?.providers || [];
};

/**
 * Link Google account to existing user
 */
export const linkGoogleAccount = async () => {
  console.log('[Supabase Auth] Linking Google account');

  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
  });

  if (error) {
    console.error('[Supabase Auth] Link Google error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Redirecting to link Google account...');
  return data;
};

/**
 * Unlink identity provider
 */
export const unlinkProvider = async (provider: 'google' | 'phone') => {
  console.log('[Supabase Auth] Unlinking provider:', provider);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No user logged in');
  }

  // Find the identity to unlink
  const identity = user.identities?.find((id: any) => id.provider === provider);

  if (!identity) {
    throw new Error(`No ${provider} identity found`);
  }

  const { error } = await supabase.auth.unlinkIdentity(identity);

  if (error) {
    console.error('[Supabase Auth] Unlink provider error:', error);
    throw error;
  }

  console.log('[Supabase Auth] Provider unlinked successfully');
};
