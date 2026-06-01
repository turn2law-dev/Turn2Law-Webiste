import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
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
  legalIssue: z.string().min(1, 'Legal issue type is required'),
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
    const { name, email, password, countryCode, mobile, city, legalIssue } = validatedData;

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
          city: city,
          legal_issue: legalIssue
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

    // For now, return success with the auth user data
    // The user profile will be created via a database trigger or 
    // we'll handle database insertion differently
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
          city: city,
          legalIssue: legalIssue
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

    // Create user object from auth metadata
    const userData = {
      id: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name || user.email,
      userType: userType,
      city: user.user_metadata?.city,
      legalIssue: user.user_metadata?.legal_issue
    };

    // Create lawyer profile if user is a lawyer
    let lawyerProfile: any = null;
    if (userType === 'lawyer') {
      lawyerProfile = {
        barNumber: user.user_metadata?.bar_number,
        specialization: user.user_metadata?.specialization,
        experienceYears: user.user_metadata?.experience_years,
        consultationFee: user.user_metadata?.consultation_fee,
        verified: false
      };
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

export default router;
