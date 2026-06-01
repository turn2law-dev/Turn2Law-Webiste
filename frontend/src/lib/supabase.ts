import { createClient } from '@supabase/supabase-js';

// Supabase configuration - MUST use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client for browser with RLS enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'turn2law-web'
    }
  }
});

// Database types for Turn2Law
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  country_code: string;
  user_type: 'client' | 'lawyer';
  email_verified: boolean;
  profile_image_url?: string;
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
  rating: number;
  total_consultations: number;
  verified: boolean;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  client_id: string;
  lawyer_id: string;
  title: string;
  description: string;
  legal_area: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  consultation_type: 'video' | 'phone' | 'chat' | 'in_person';
  scheduled_at?: string;
  duration_minutes: number;
  fee: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  razorpay_payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  message_text: string;
  message_type: 'text' | 'file' | 'image';
  file_url?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'success' | 'pending' | 'failed';
  payment_method?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  consultation_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletBalance {
  id: string;
  user_id: string;
  balance: number;
  total_earnings: number;
  total_spent: number;
  pending_amount: number;
  created_at: string;
  updated_at: string;
}

// Authentication helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  return { error };
};

// User profile functions
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

// Lawyer profile functions
export const getLawyerProfile = async (userId: string): Promise<LawyerProfile | null> => {
  const { data, error } = await supabase
    .from('lawyer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching lawyer profile:', error);
    return null;
  }
  return data;
};

export const updateLawyerProfile = async (userId: string, updates: Partial<LawyerProfile>) => {
  const { data, error } = await supabase
    .from('lawyer_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
};

// Consultation functions
export const getUserConsultations = async (userId: string, userType: 'client' | 'lawyer') => {
  const field = userType === 'client' ? 'client_id' : 'lawyer_id';
  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      client:profiles!consultations_client_id_fkey(full_name, email),
      lawyer:profiles!consultations_lawyer_id_fkey(full_name, email)
    `)
    .eq(field, userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching consultations:', error);
    return [];
  }
  return data;
};

export const createConsultation = async (consultation: Partial<Consultation>) => {
  const { data, error } = await supabase
    .from('consultations')
    .insert([consultation])
    .select()
    .single();

  return { data, error };
};

export const updateConsultation = async (id: string, updates: Partial<Consultation>) => {
  const { data, error } = await supabase
    .from('consultations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Message functions
export const getConsultationMessages = async (consultationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, profile_image_url)
    `)
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data;
};

export const sendMessage = async (message: Partial<Message>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single();

  return { data, error };
};

// Real-time subscription for messages
export const subscribeToMessages = (consultationId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel(`messages:${consultationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${consultationId}`
      },
      callback
    )
    .subscribe();

  return subscription;
};

// Wallet functions
export const getWalletBalance = async (userId: string): Promise<WalletBalance | null> => {
  const { data, error } = await supabase
    .from('wallet_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching wallet balance:', error);
    return null;
  }
  return data;
};

export const getTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data;
};

export const createTransaction = async (transaction: Partial<Transaction>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  return { data, error };
};

export const updateWalletBalance = async (userId: string, amount: number, type: 'credit' | 'debit') => {
  // Get current balance
  const walletBalance = await getWalletBalance(userId);

  if (!walletBalance) {
    // Create new wallet balance
    const { data, error } = await supabase
      .from('wallet_balances')
      .insert([{
        user_id: userId,
        balance: type === 'credit' ? amount : -amount,
        total_earnings: type === 'credit' ? amount : 0,
        total_spent: type === 'debit' ? amount : 0,
        pending_amount: 0
      }])
      .select()
      .single();

    return { data, error };
  }

  // Update existing balance
  const newBalance = type === 'credit'
    ? walletBalance.balance + amount
    : walletBalance.balance - amount;

  const updates: Partial<WalletBalance> = {
    balance: newBalance,
    updated_at: new Date().toISOString()
  };

  if (type === 'credit') {
    updates.total_earnings = walletBalance.total_earnings + amount;
  } else {
    updates.total_spent = walletBalance.total_spent + amount;
  }

  const { data, error } = await supabase
    .from('wallet_balances')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
};

// LawGPT chat history functions
export const getLawGPTSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('lawgpt_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching LawGPT sessions:', error);
    return [];
  }
  return data;
};

export const createLawGPTSession = async (userId: string, title: string) => {
  const { data, error } = await supabase
    .from('lawgpt_sessions')
    .insert([{
      user_id: userId,
      title,
      messages: []
    }])
    .select()
    .single();

  return { data, error };
};

export const updateLawGPTSession = async (sessionId: string, messages: any[]) => {
  const { data, error } = await supabase
    .from('lawgpt_sessions')
    .update({
      messages,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();

  return { data, error };
};

// Statistics functions
export const getClientStats = async (userId: string) => {
  // Get total consultations
  const { count: totalConsultations } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', userId);

  // Get active cases
  const { count: activeCases } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', userId)
    .in('status', ['pending', 'accepted', 'in_progress']);

  // Get wallet balance
  const walletBalance = await getWalletBalance(userId);

  return {
    totalConsultations: totalConsultations || 0,
    activeCases: activeCases || 0,
    walletBalance: walletBalance?.balance || 0,
    totalSpent: walletBalance?.total_spent || 0
  };
};

export const getLawyerStats = async (userId: string) => {
  // Get total clients (unique client IDs from consultations)
  const { data: consultations } = await supabase
    .from('consultations')
    .select('client_id')
    .eq('lawyer_id', userId);

  const uniqueClients = consultations
    ? new Set(consultations.map(c => c.client_id)).size
    : 0;

  // Get total consultations
  const { count: totalConsultations } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('lawyer_id', userId);

  // Get completed consultations
  const { count: completedConsultations } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('lawyer_id', userId)
    .eq('status', 'completed');

  // Get wallet balance
  const walletBalance = await getWalletBalance(userId);

  // Get this month's earnings
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyTransactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'credit')
    .gte('created_at', startOfMonth.toISOString());

  const monthlyEarnings = monthlyTransactions
    ? monthlyTransactions.reduce((sum, t) => sum + t.amount, 0)
    : 0;

  return {
    totalClients: uniqueClients,
    totalConsultations: totalConsultations || 0,
    completedConsultations: completedConsultations || 0,
    walletBalance: walletBalance?.balance || 0,
    monthlyEarnings,
    totalEarnings: walletBalance?.total_earnings || 0,
    rating: 5.0 // TODO: Calculate from reviews table
  };
};

// Recent activity functions
export const getRecentActivity = async (userId: string, userType: 'client' | 'lawyer', limit: number = 10) => {
  const activities: any[] = [];

  // Get recent consultations
  const field = userType === 'client' ? 'client_id' : 'lawyer_id';
  const { data: consultations } = await supabase
    .from('consultations')
    .select(`
      id,
      title,
      status,
      created_at,
      ${userType === 'client' ? 'lawyer:profiles!consultations_lawyer_id_fkey(full_name)' : 'client:profiles!consultations_client_id_fkey(full_name)'}
    `)
    .eq(field, userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (consultations) {
    activities.push(...consultations.map(c => {
      let participantName: string | undefined;

      if (userType === 'client') {
        // For clients, get lawyer name
        const lawyer = (c as any).lawyer;
        participantName = Array.isArray(lawyer) ? lawyer[0]?.full_name : lawyer?.full_name;
      } else {
        // For lawyers, get client name
        const client = (c as any).client;
        participantName = Array.isArray(client) ? client[0]?.full_name : client?.full_name;
      }

      return {
        id: c.id,
        type: 'consultation',
        title: c.title,
        status: c.status,
        date: c.created_at,
        participant: participantName
      };
    }));
  }

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, type, amount, description, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (transactions) {
    activities.push(...transactions.map(t => ({
      id: t.id,
      type: 'transaction',
      transactionType: t.type,
      amount: t.amount,
      description: t.description,
      status: t.status,
      date: t.created_at
    })));
  }

  // Sort all activities by date
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return activities.slice(0, limit);
};

// Notification functions
export const getNotifications = async (userId: string) => {
  // For now, we'll generate notifications from recent service requests and contact messages
  // In a real app, you'd have a dedicated notifications table
  const notifications: any[] = [];

  try {
    // 1. Get recent service request updates
    const { data: requests } = await supabase
      .from('service_requests')
      .select('id, service_type, status, updated_at, service_number')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (requests) {
      notifications.push(...requests.map(req => ({
        id: req.id,
        type: req.status === 'completed' ? 'success' : 'info',
        title: `Service Update: ${req.service_type}`,
        message: `Your request (${req.service_number}) is now ${req.status.replace('_', ' ')}. Email notification sent.`,
        time: new Date(req.updated_at).toLocaleString(),
        read: false,
        source: 'service_request'
      })));
    }

    // 2. Get recent contact messages (if admin or self)
    // For demo/MVP, we'll just show a "Message Received" notification if the user has sent one recently
    const { data: messages } = await supabase
      .from('contact_messages')
      .select('id, created_at, message')
      .eq('email', (await supabase.auth.getUser()).data.user?.email || '')
      .order('created_at', { ascending: false })
      .limit(3);

    if (messages) {
      notifications.push(...messages.map(msg => ({
        id: msg.id,
        type: 'success',
        title: 'Message Sent',
        message: 'We received your message. Our team will contact you shortly.',
        time: new Date(msg.created_at).toLocaleString(),
        read: false,
        source: 'contact_message'
      })));
    }

    // Sort by time
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  } catch (error) {
    console.error('Error getting notifications:', error);
  }

  return notifications;
};
