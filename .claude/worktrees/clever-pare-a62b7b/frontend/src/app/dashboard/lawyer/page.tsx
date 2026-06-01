"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  FileText,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  Search,
  MessageCircle,
  Scale,
  BookOpen,
  Settings,
  Bell,
  ChevronRight,
  TrendingUp,
  Shield,
  Star,
  Gavel,
  BarChart3,
  Target,
  Award,
  UserCheck,
  Briefcase,
  TrendingDown,
  LogOut,
  User,
  ChevronDown,
  Wallet
} from 'lucide-react';
import Header from '@/components/layout/header';
import { 
  getLawyerProfile, 
  getLawyerStats, 
  getRecentActivity,
  getUserConsultations
} from '@/lib/supabase';
import { signOut } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName: string;
  userType: string;
}

interface LawyerProfile {
  bar_number?: string;
  experience_years?: number;
  specialization?: string;
  education?: string;
  court_practice?: string;
  languages?: string;
  bio?: string;
  consultation_fee?: number;
  profile_image_url?: string;
  rating?: number;
  verified?: boolean;
}

interface LawyerStats {
  totalClients: number;
  totalConsultations: number;
  completedConsultations: number;
  walletBalance: number;
  monthlyEarnings: number;
  totalEarnings: number;
  rating: number;
}

const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 62 79" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300">
    <path d="M46.3782 0L30.7564 16.3146L36.1293 21.5024L42.6514 14.691V53.3941L6.77247 17.715C4.26262 15.2191 0 17.0044 0 20.5514V79H7.45364V28.9262L43.3326 64.6053C45.8423 67.1011 50.105 65.316 50.105 61.7689V14.691L56.6272 21.5024L62 16.3146L46.3782 0Z" fill="white" />
  </svg>
);

const LawyerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<LawyerStats>({
    totalClients: 0,
    totalConsultations: 0,
    completedConsultations: 0,
    walletBalance: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    rating: 5.0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('[Lawyer Dashboard] Checking Supabase Auth session...');
      
      // Import Supabase auth functions
      const { getSession, getUserProfile } = await import('@/lib/supabase-auth');
      
      // Check Supabase session
      const session = await getSession();
      
      if (!session || !session.user) {
        console.log('[Lawyer Dashboard] No active session, redirecting to login');
        router.push('/login');
        return;
      }
      
      console.log('[Lawyer Dashboard] Session found, user ID:', session.user.id);
      
      // Fetch user profile from database
      const profile = await getUserProfile(session.user.id);
      
      if (!profile) {
        console.error('[Lawyer Dashboard] Profile not found');
        router.push('/login');
        return;
      }
      
      console.log('[Lawyer Dashboard] Profile fetched, user type:', profile.user_type);
      
      // Check user type
      if (profile.user_type !== 'lawyer') {
        console.log('[Lawyer Dashboard] User is not a lawyer, redirecting to client dashboard');
        router.push('/dashboard/client');
        return;
      }
      
      // Set user data (convert to the expected format)
      setUser({
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        userType: profile.user_type
      });
      
      // Fetch real data from Supabase
      const [lawyerProfileData, lawyerStats, activity, userConsultations] = await Promise.all([
        getLawyerProfile(profile.id),
        getLawyerStats(profile.id),
        getRecentActivity(profile.id, 'lawyer', 5),
        getUserConsultations(profile.id, 'lawyer')
      ]);
      
      setLawyerProfile(lawyerProfileData);
      setStats(lawyerStats);
      setRecentActivity(activity);
      setConsultations(userConsultations);
      
    } catch (error) {
      console.error('[Lawyer Dashboard] Error loading dashboard:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your practice dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Header */}
      <Header hideAuthButtons={false} />

      {/* Hero Welcome Section */}
      <div className="bg-gradient-to-br from-background via-background to-card border-b border-border/50 pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-body font-bold text-foreground mb-4">
                Welcome, <span className="text-primary">Advocate {user.fullName.split(' ')[0]}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl font-body">
                Manage your legal practice, connect with clients, and grow your expertise. Your professional dashboard awaits.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold font-body">
                  <Calendar className="mr-2 h-5 w-5" />
                  Set Availability
                </Button>
                <Button size="lg" variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10 font-body" onClick={() => setActiveTab('earnings')}>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Analytics
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="w-80 h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-primary/20 rounded-3xl blur-2xl"></div>
                <Image
                  src="/images/landingpagephoto.png"
                  alt="Legal Practice"
                  fill
                  className="object-cover rounded-2xl border border-border/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="w-full overflow-x-auto sm:overflow-visible">
            <TabsList className="flex sm:grid sm:w-full sm:grid-cols-5 lg:w-fit gap-2 min-w-max sm:min-w-0 px-1">
              <TabsTrigger value="overview" className="flex-shrink-0">Overview</TabsTrigger>
              <TabsTrigger value="consultations" className="flex-shrink-0">Consultations</TabsTrigger>
              <TabsTrigger value="clients" className="flex-shrink-0">My Clients</TabsTrigger>
              <TabsTrigger value="earnings" className="flex-shrink-0">Earnings</TabsTrigger>
              <TabsTrigger value="profile" className="flex-shrink-0">Profile</TabsTrigger>
            </TabsList>
          </div>


          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Modern Welcome Banner */}
            <Card className="border-0 bg-gradient-to-br from-secondary via-secondary to-secondary/80 text-secondary-foreground relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
              </div>
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-body font-bold mb-2">
                      Welcome to Your Practice Dashboard, Advocate {user.fullName}!
                    </CardTitle>
                    <p className="text-secondary-foreground/90 text-lg max-w-2xl font-body">
                      Manage your consultations, connect with clients, and grow your legal practice with our comprehensive tools.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Professional
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <Award className="mr-2 h-4 w-4" />
                    Verify Profile
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <Target className="mr-2 h-4 w-4" />
                    Set Goals
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Clients</p>
                      <p className="text-3xl font-body font-semibold text-foreground">{stats.totalClients}</p>
                      <p className="text-xs text-secondary mt-1">Lifetime clients served</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Earnings</p>
                      <p className="text-3xl font-body font-semibold text-foreground">₹{stats.monthlyEarnings.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-secondary mt-1">This month's revenue</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Consultations</p>
                      <p className="text-3xl font-body font-semibold text-foreground">{stats.totalConsultations}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stats.completedConsultations} completed</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Success Rating</p>
                      <p className="text-3xl font-body font-semibold text-foreground">{stats.rating.toFixed(1)}</p>
                      <p className="text-xs text-secondary mt-1">Client satisfaction</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Link href="/dashboard/lawyer/wallet" className="block">
                <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Wallet Balance</p>
                        <p className="text-3xl font-body font-semibold text-foreground">₹{stats.walletBalance.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          View earnings
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Wallet className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Modern Actions & Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Quick Actions */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-body">Practice Management</CardTitle>
                  <p className="text-sm text-muted-foreground font-body">Manage your legal practice efficiently</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button size="lg" className="h-24 flex flex-col justify-center space-y-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold font-body" onClick={() => setActiveTab('consultations')}>
                      <Calendar className="w-6 h-6" />
                      <span>Consultations</span>
                      <span className="text-xs opacity-80">Manage bookings</span>
                    </Button>

                    <Link href="/dashboard/lawyer/wallet" className="block">
                      <Button size="lg" variant="outline" className="w-full h-24 flex flex-col justify-center space-y-2 border-primary/50 text-primary hover:bg-primary/10 font-body">
                        <Wallet className="w-6 h-6" />
                        <span>My Wallet</span>
                        <span className="text-xs opacity-70">Earnings & withdrawals</span>
                      </Button>
                    </Link>

                    <Button size="lg" variant="outline" className="h-24 flex flex-col justify-center space-y-2 border-secondary/50 text-secondary hover:bg-secondary/10 font-body" onClick={() => setActiveTab('clients')}>
                      <Users className="w-6 h-6" />
                      <span>My Clients</span>
                      <span className="text-xs opacity-70">Client management</span>
                    </Button>

                    <Button size="lg" variant="outline" className="h-24 flex flex-col justify-center space-y-2 border-border/50 hover:bg-card font-body" onClick={() => setActiveTab('earnings')}>
                      <BarChart3 className="w-6 h-6" />
                      <span>View Analytics</span>
                      <span className="text-xs opacity-70">Revenue reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Recent Activity */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-body">Recent Activity</CardTitle>
                  <p className="text-sm text-muted-foreground font-body">Your latest client interactions</p>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12">
                      <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
                        <Briefcase className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-body font-semibold text-foreground mb-2">No Recent Activity</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm font-body">Your consultations, client interactions, and practice updates will appear here</p>
                      <Button variant="outline" size="sm" className="font-body" onClick={() => setActiveTab('consultations')}>
                        Start Taking Consultations
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-card/50 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'consultation' ? 'bg-primary/20' : 'bg-secondary/20'
                          }`}>
                            {activity.type === 'consultation' ? (
                              <Calendar className="w-5 h-5 text-primary" />
                            ) : (
                              <DollarSign className="w-5 h-5 text-secondary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">
                              {activity.type === 'consultation' ? activity.title : activity.description}
                            </p>
                            {activity.type === 'consultation' && activity.participant && (
                              <p className="text-sm text-muted-foreground">Client: {activity.participant}</p>
                            )}
                            {activity.type === 'transaction' && (
                              <p className="text-sm font-medium text-secondary">
                                +₹{activity.amount}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.date).toLocaleDateString('en-IN', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <Badge variant={activity.status === 'completed' || activity.status === 'success' ? 'default' : 'secondary'}>
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Practice Insights */}
            <Card className="border-border/50 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-body">Practice Insights</CardTitle>
                <p className="text-sm text-muted-foreground">Grow your legal practice with data-driven insights</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group p-6 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-body font-semibold mb-2">Growth Analytics</h3>
                    <p className="text-sm text-muted-foreground">Track your practice growth and revenue trends</p>
                  </div>

                  <div className="group p-6 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                      <UserCheck className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="font-body font-semibold mb-2">Client Satisfaction</h3>
                    <p className="text-sm text-muted-foreground">Monitor client feedback and ratings</p>
                  </div>

                  <div className="group p-6 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                      <Scale className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-body font-semibold mb-2">Case Management</h3>
                    <p className="text-sm text-muted-foreground">Organize and track legal cases efficiently</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-body font-bold">My Consultations</h2>
                <p className="text-muted-foreground">Manage your scheduled appointments and client meetings</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Calendar className="mr-2 h-4 w-4" />
                Set Availability
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-body font-semibold mb-2">No Consultations Scheduled</h3>
              <p className="text-muted-foreground mb-6 max-w-md">Your upcoming consultations will appear here. Set your availability to start receiving bookings from clients.</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Clock className="mr-2 h-5 w-5" />
                Set Your Availability
              </Button>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-body font-bold">My Clients</h2>
                <p className="text-muted-foreground">Manage your client relationships and case history</p>
              </div>
              <Button variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10">
                <UserCheck className="mr-2 h-4 w-4" />
                Client Management
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 bg-secondary/20 rounded-3xl flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-body font-semibold mb-2">No Clients Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">Your client list will appear here as you start taking consultations. Build your practice by connecting with clients who need legal expertise.</p>
              <Button size="lg" variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10">
                <BookOpen className="mr-2 h-5 w-5" />
                Learn About Client Management
              </Button>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-body font-bold">Earnings & Analytics</h2>
                <p className="text-muted-foreground">Track your practice revenue and financial performance</p>
              </div>
              <Button variant="outline" className="border-border/50 hover:bg-card">
                <BarChart3 className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-body">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-body font-semibold text-foreground">₹{stats.monthlyEarnings.toLocaleString('en-IN')}</div>
                      <p className="text-sm text-muted-foreground">{stats.totalConsultations} consultations</p>
                      <p className="text-xs text-secondary mt-1">Monthly revenue</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-body">Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-body font-semibold text-foreground">₹{stats.walletBalance.toLocaleString('en-IN')}</div>
                      <p className="text-sm text-muted-foreground">Available balance</p>
                      <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
                    </div>
                    <div className="w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-body">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-body font-semibold text-foreground">₹{stats.totalEarnings.toLocaleString('en-IN')}</div>
                      <p className="text-sm text-muted-foreground">All time revenue</p>
                      <p className="text-xs text-secondary mt-1">Your practice income</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Analytics */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-body">Revenue Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">Detailed breakdown of your practice earnings</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-body font-semibold mb-2">No Revenue Data Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">Start taking consultations to see detailed analytics about your practice revenue, client trends, and growth patterns.</p>
                  <div className="flex gap-3">
                    <Button onClick={() => setActiveTab('consultations')} className="bg-primary hover:bg-primary/90">
                      Start Consulting
                    </Button>
                    <Button variant="outline" className="border-border/50 hover:bg-card">
                      Learn About Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-body">Professional Profile</CardTitle>
                <p className="text-sm text-muted-foreground">Manage your professional information and credentials</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center border border-border/50">
                    <Gavel className="w-12 h-12 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Full Name</label>
                          <p className="text-lg font-semibold text-foreground">{user.fullName}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Email Address</label>
                          <p className="text-lg text-foreground">{user.email}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Bar Registration Number</label>
                          <p className="text-lg text-foreground">{lawyerProfile?.bar_number || 'Not set'}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Years of Experience</label>
                          <p className="text-lg text-foreground">{lawyerProfile?.experience_years || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Legal Specialization</label>
                          <p className="text-lg text-foreground">{lawyerProfile?.specialization || 'Not set'}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Court Practice Areas</label>
                          <p className="text-lg text-foreground">{lawyerProfile?.court_practice || 'Not set'}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Languages Spoken</label>
                          <p className="text-lg text-foreground">{lawyerProfile?.languages || 'Not set'}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Consultation Fee</label>
                          <p className="text-lg text-foreground">₹{lawyerProfile?.consultation_fee || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {lawyerProfile?.bio && (
                  <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Professional Bio</label>
                    <p className="text-base text-foreground leading-relaxed">{lawyerProfile.bio}</p>
                  </div>
                )}

                <div className="pt-6 border-t border-border/50 flex gap-4">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10">
                    <Award className="mr-2 h-4 w-4" />
                    Add Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LawyerDashboard;
