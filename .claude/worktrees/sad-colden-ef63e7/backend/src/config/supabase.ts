import { createClient } from '@supabase/supabase-js';

// Supabase configuration - MUST use environment variables for security
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗ MISSING');
  console.error('   SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗ MISSING');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗ MISSING');
  throw new Error('Missing required Supabase environment variables. Check your .env file.');
}

// Debug logging (safe - only shows if keys exist, not the actual keys)
console.log('🔑 Supabase Config:');
console.log('   URL:', supabaseUrl);
console.log('   Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
console.log('   Service Key:', supabaseServiceKey.substring(0, 20) + '...');

// Create Supabase client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Create Supabase admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': supabaseServiceKey
    }
  }
});

// Database types for Turn2Law - Matching Frontend Structure
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  country_code: string;
  user_type: 'client' | 'lawyer';
  email_verified: boolean;
  profile_image_url?: string;
  // Client specific fields
  city?: string;
  created_at: string;
  updated_at: string;
}

export interface LawyerProfile {
  id: string;
  user_id: string;
  bar_number: string;
  experience_years: number;
  specialization: string;
  education: string;
  court_practice: string;
  languages: string;
  bio: string;
  consultation_fee: number;
  profile_image_url?: string;
  verified: boolean;
  rating: number;
  total_reviews: number;
  total_consultations: number;
  availability_status: 'available' | 'busy' | 'offline';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  client_id: string;
  lawyer_id: string;
  category_id: string;
  title: string;
  description: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduled_at: string;
  duration_minutes: number;
  consultation_type: 'video' | 'phone' | 'chat';
  amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  meeting_link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  consultation_id: string;
  client_id: string;
  lawyer_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Helper function to check Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.warn('Supabase connection test failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.warn('❌ Supabase connection failed:', error);
    return false;
  }
}