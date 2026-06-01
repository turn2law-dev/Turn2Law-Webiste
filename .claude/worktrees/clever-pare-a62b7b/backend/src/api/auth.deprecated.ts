/**
 * ⚠️ DEPRECATED - DO NOT USE
 * 
 * This file contains the old custom authentication implementation.
 * 
 * Authentication is now handled by Supabase Auth on the frontend.
 * This file is kept as a backup only and should not be imported.
 * 
 * Migration Date: November 18, 2025
 * 
 * New Auth Implementation:
 * - Frontend: /frontend/src/lib/supabase-auth.ts
 * - Login: Uses signInWithEmail()
 * - Signup: Uses signUpWithEmail()
 * - Logout: Uses signOut()
 * - Session: Managed automatically by Supabase
 * 
 * See: /backend/BACKEND_MIGRATION.md for details
 */

import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { upload, handleMulterError, getFileUrl } from '../utils/fileUpload';

const router = Router();

// Validation schemas matching your frontend signup form
const clientRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  countryCode: z.string().default('+91'),
  mobile: z.string().min(10, 'Invalid mobile number'),
  city: z.string().min(2, 'City is required'),
  userType: z.literal('client')
});

const lawyerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  countryCode: z.string().default('+91'),
  mobile: z.string().min(10, 'Invalid mobile number'),
  barNumber: z.string().min(5, 'Bar registration number is required'),
  experience: z.string().min(1, 'Experience is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  education: z.string().min(5, 'Educational background is required'),
  courtPractice: z.string().min(2, 'Court practice location is required'),
  languages: z.string().min(2, 'Languages are required'),
  bio: z.string().min(10, 'Professional bio must be at least 10 characters'),
  consultationFee: z.string().min(1, 'Consultation fee is required'),
  userType: z.literal('lawyer')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Helper function to generate JWT token
const generateToken = (userId: string, userType: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  const JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN || '7d';
  
  return jwt.sign(
    { userId, userType },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE_IN } as SignOptions
  );
};

// Register client - using a different approach to handle RLS
router.post('/register/client', async (req: Request, res: Response) => {
  try {
    const validatedData = clientRegisterSchema.parse(req.body);
    const { name, email, password, countryCode, mobile, city } = validatedData;

    // Create auth user first
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          user_type: 'client',
          phone: mobile,
          country_code: countryCode,
          city: city
        }
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({ 
        success: false, 
        error: authError.message || 'Failed to create authentication' 
      });
    }

    if (!authUser.user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to create user account' 
      });
    }

    // Insert user record into database using admin client to bypass RLS
    console.log('✅ Creating user record in database for:', authUser.user.id);
    const { error: userInsertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email: email,
        full_name: name,
        phone: mobile,
        country_code: countryCode,
        user_type: 'client',
        city: city,
        email_verified: false
      });

    if (userInsertError) {
      console.error('❌ Error creating user record:', userInsertError);
      // Continue anyway since auth user was created
    } else {
      console.log('✅ User record created successfully');
    }

    // Create wallet balance record for the client
    console.log('✅ Creating wallet balance for user:', authUser.user.id);
    const { error: walletError } = await supabaseAdmin
      .from('wallet_balances')
      .insert({
        user_id: authUser.user.id,
        balance: 0,
        total_earnings: 0,
        total_spent: 0,
        pending_amount: 0
      });

    if (walletError) {
      // Ignore duplicate key errors (wallet already exists)
      if (walletError.code === '23505') {
        console.log('ℹ️  Wallet balance already exists for user');
      } else {
        console.error('❌ Error creating wallet balance:', walletError);
      }
      // Continue anyway
    } else {
      console.log('✅ Wallet balance created successfully');
    }

    const token = generateToken(authUser.user.id, 'client');

    return res.status(201).json({
      success: true,
      message: 'Client account created successfully',
      data: {
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          fullName: name,
          userType: 'client',
          city: city
        },
        token
      }
    });

  } catch (error) {
    console.error('Client registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Register lawyer - simplified approach
router.post('/register/lawyer', upload.single('profileImage'), handleMulterError, async (req: Request, res: Response) => {
  try {
    const validatedData = lawyerRegisterSchema.parse(req.body);
    const { 
      name, email, password, countryCode, mobile, barNumber, 
      experience, specialization, education, courtPractice, 
      languages, bio, consultationFee 
    } = validatedData;

    // Get uploaded file URL if present
    let profileImageUrl: string | null = null;
    if (req.file) {
      profileImageUrl = getFileUrl(req.file.filename);
    }

    // Create auth user first with all metadata
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          user_type: 'lawyer',
          phone: mobile,
          country_code: countryCode,
          bar_number: barNumber,
          experience_years: parseInt(experience),
          specialization: specialization,
          education: education,
          court_practice: courtPractice,
          languages: languages,
          bio: bio,
          consultation_fee: parseFloat(consultationFee),
          profile_image_url: profileImageUrl
        }
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({ 
        success: false, 
        error: authError.message || 'Failed to create authentication' 
      });
    }

    if (!authUser.user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to create user account' 
      });
    }

    // Insert user record into database using admin client to bypass RLS
    const { error: userInsertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email: email,
        full_name: name,
        phone: mobile,
        country_code: countryCode,
        user_type: 'lawyer',
        email_verified: false,
        profile_image_url: profileImageUrl
      });

    if (userInsertError) {
      console.error('Error creating user record:', userInsertError);
      // Continue anyway since auth user was created
    }

    // Insert lawyer profile record
    const { error: lawyerProfileError } = await supabaseAdmin
      .from('lawyer_profiles')
      .insert({
        user_id: authUser.user.id,
        bar_number: barNumber,
        experience_years: parseInt(experience),
        specialization: specialization,
        education: education,
        court_practice: courtPractice,
        languages: languages,
        bio: bio,
        consultation_fee: parseFloat(consultationFee),
        profile_image_url: profileImageUrl,
        verified: false,
        rating: 0.0,
        total_reviews: 0,
        total_consultations: 0,
        availability_status: 'available',
        is_active: true
      });

    if (lawyerProfileError) {
      console.error('Error creating lawyer profile:', lawyerProfileError);
      // Continue anyway
    }

    // Create wallet balance record for the lawyer
    const { error: walletError } = await supabaseAdmin
      .from('wallet_balances')
      .insert({
        user_id: authUser.user.id,
        balance: 0,
        total_earnings: 0,
        total_spent: 0,
        pending_amount: 0
      });

    if (walletError) {
      // Ignore duplicate key errors (wallet already exists)
      if (walletError.code === '23505') {
        console.log('ℹ️  Wallet balance already exists for user');
      } else {
        console.error('❌ Error creating wallet balance:', walletError);
      }
      // Continue anyway
    }

    const token = generateToken(authUser.user.id, 'lawyer');

    return res.status(201).json({
      success: true,
      message: 'Lawyer account created successfully. Profile pending verification.',
      data: {
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          fullName: name,
          userType: 'lawyer'
        },
        lawyerProfile: {
          barNumber: barNumber,
          specialization: specialization,
          experienceYears: parseInt(experience),
          consultationFee: parseFloat(consultationFee),
          verified: false
        },
        token
      }
    });

  } catch (error) {
    console.error('Lawyer registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Login endpoint - simplified to work with auth metadata
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const user = authData.user;
    const userType = user.user_metadata?.user_type || 'client';

    // Check if user record exists in database, create if not
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // Create user record if it doesn't exist
      const { error: userInsertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email || 'User',
          phone: user.user_metadata?.phone || '',
          country_code: user.user_metadata?.country_code || '+91',
          user_type: userType,
          email_verified: user.email_confirmed_at ? true : false,
          city: user.user_metadata?.city,
          profile_image_url: user.user_metadata?.profile_image_url
        });

      if (userInsertError) {
        console.error('Error creating user record on login:', userInsertError);
      }

      // Create wallet balance if doesn't exist
      const { error: walletError } = await supabaseAdmin
        .from('wallet_balances')
        .insert({
          user_id: user.id,
          balance: 0,
          total_earnings: 0,
          total_spent: 0,
          pending_amount: 0
        });

      if (walletError && walletError.code !== '23505') {
        // Only log if it's not a duplicate key error
        console.error('Error creating wallet on login:', walletError);
      }

      // If lawyer, create lawyer profile
      if (userType === 'lawyer') {
        const { error: lawyerProfileError } = await supabaseAdmin
          .from('lawyer_profiles')
          .insert({
            user_id: user.id,
            bar_number: user.user_metadata?.bar_number || 'PENDING',
            experience_years: user.user_metadata?.experience_years || 0,
            specialization: user.user_metadata?.specialization || 'General',
            education: user.user_metadata?.education || '',
            court_practice: user.user_metadata?.court_practice || '',
            languages: user.user_metadata?.languages || 'English',
            bio: user.user_metadata?.bio || '',
            consultation_fee: user.user_metadata?.consultation_fee || 1000,
            profile_image_url: user.user_metadata?.profile_image_url,
            verified: false,
            rating: 0.0,
            total_reviews: 0,
            total_consultations: 0,
            availability_status: 'available',
            is_active: true
          });

        if (lawyerProfileError) {
          console.error('Error creating lawyer profile on login:', lawyerProfileError);
        }
      }
    }

    // Create user object from auth metadata
    const userData = {
      id: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name || user.email || 'User',
      userType: userType,
      city: user.user_metadata?.city
    };

    // Fetch lawyer profile if user is a lawyer
    let lawyerProfile: any = null;
    if (userType === 'lawyer') {
      const { data: profile } = await supabaseAdmin
        .from('lawyer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        lawyerProfile = {
          barNumber: profile.bar_number,
          specialization: profile.specialization,
          experienceYears: profile.experience_years,
          consultationFee: profile.consultation_fee,
          verified: profile.verified
        };
      }
    }

    const token = generateToken(user.id, userType);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        lawyerProfile,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Test endpoint to verify database setup
router.get('/test/db-check', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test if we can query the users table
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, user_type')
      .limit(1);
    
    // Test if we can query the wallet_balances table
    const { data: wallets, error: walletsError } = await supabaseAdmin
      .from('wallet_balances')
      .select('user_id, balance')
      .limit(1);
    
    return res.status(200).json({
      success: true,
      message: 'Database connection test',
      results: {
        usersTable: {
          accessible: !usersError,
          error: usersError?.message || null,
          sampleCount: users?.length || 0
        },
        walletBalancesTable: {
          accessible: !walletsError,
          error: walletsError?.message || null,
          sampleCount: wallets?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database test failed',
      details: error
    });
  }
});

export default router;
