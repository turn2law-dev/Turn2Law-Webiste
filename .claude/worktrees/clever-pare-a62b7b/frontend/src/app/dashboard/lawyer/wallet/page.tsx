"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotification } from '@/contexts/notification-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Wallet, 
  Plus, 
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock, 
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  CreditCard,
  Calendar,
  Filter,
  Download,
  ArrowLeft,
  AlertCircle,
  Banknote,
  Receipt,
  RefreshCw,
  Shield,
  Zap,
  Gift,
  Star,
  ChevronRight,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  TrendingDown,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Briefcase,
  Scale,
  Gavel
} from 'lucide-react';
import Header from '@/components/layout/header';
import {
  getCurrentUser,
  getUserProfile,
  getWalletBalance,
  getTransactions,
  createTransaction,
  updateWalletBalance,
  getUserConsultations,
  type Transaction as SupabaseTransaction
} from '@/lib/supabase';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  paymentMethod?: string;
  paytmTransactionId?: string;
  clientName?: string;
  consultationId?: string;
}

interface BankAccount {
  id: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  bankName: string;
  isDefault: boolean;
}

const LawyerWalletPage = () => {
  const { showNotification } = useNotification();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Wallet states
  const [walletBalance, setWalletBalance] = useState(0);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dialog states
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  
  // Data from Supabase
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Statistics
  const [totalEarningsThisMonth, setTotalEarningsThisMonth] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [averageFee, setAverageFee] = useState(0);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        // Get current user from Supabase
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          window.location.href = '/login';
          return;
        }

        // Get user profile
        const userProfile = await getUserProfile(currentUser.id);
        if (!userProfile || userProfile.user_type !== 'lawyer') {
          window.location.href = '/dashboard/client';
          return;
        }

        setUser({
          id: userProfile.id,
          email: userProfile.email,
          fullName: userProfile.full_name,
          userType: userProfile.user_type
        });

        // Get wallet balance from Supabase
        const wallet = await getWalletBalance(currentUser.id);
        if (wallet) {
          setWalletBalance(wallet.balance);
          setTotalWithdrawn(wallet.total_spent);
          setPendingAmount(wallet.pending_amount);
        }

        // Get transactions from Supabase
        const txns = await getTransactions(currentUser.id);
        
        // Get consultations to enrich transaction data with client names
        const consultations = await getUserConsultations(currentUser.id, 'lawyer');
        
        const formattedTransactions: Transaction[] = txns.map((txn: SupabaseTransaction) => {
          const consultation = consultations.find((c: any) => c.id === txn.consultation_id);
          return {
            id: txn.id,
            type: txn.type,
            amount: txn.amount,
            description: txn.description,
            status: txn.status,
            date: txn.created_at,
            paymentMethod: txn.payment_method || 'Paytm',
            paytmTransactionId: txn.razorpay_payment_id, // Reuse field for Paytm
            clientName: consultation?.client?.full_name || undefined,
            consultationId: txn.consultation_id || undefined
          };
        });
        
        setTransactions(formattedTransactions);

        // Calculate statistics
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const thisMonthTxns = formattedTransactions.filter(txn => {
          const txnDate = new Date(txn.date);
          return txn.type === 'credit' && 
                 txn.status === 'success' &&
                 txnDate.getMonth() === thisMonth &&
                 txnDate.getFullYear() === thisYear;
        });

        const monthlyEarnings = thisMonthTxns.reduce((sum, txn) => sum + txn.amount, 0);
        setTotalEarningsThisMonth(monthlyEarnings);
        setTotalConsultations(thisMonthTxns.length);
        setAverageFee(thisMonthTxns.length > 0 ? monthlyEarnings / thisMonthTxns.length : 0);

        // Calculate growth (mock for now - would need previous month data)
        setMonthlyGrowth(12.5);

        // Load bank accounts (from localStorage for now, move to Supabase later)
        const savedBanks = localStorage.getItem(`banks_${currentUser.id}`);
        if (savedBanks) {
          setBankAccounts(JSON.parse(savedBanks));
        }

      } catch (error) {
        console.error('Error loading wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 500) {
      showNotification('Minimum withdrawal amount is ₹500', 'error');
      return;
    }
    if (amount > walletBalance) {
      showNotification('Insufficient balance', 'error');
      return;
    }
    if (!selectedBank) {
      showNotification('Please select a bank account', 'error');
      return;
    }
    if (!user) return;

    try {
      // Get bank details
      const bank = bankAccounts.find(b => b.id === selectedBank);
      
      // Create withdrawal transaction in Supabase
      const txn = await createTransaction({
        user_id: user.id,
        type: 'debit',
        amount: amount,
        description: `Withdrawal to ${bank?.bankName || 'Bank Account'}`,
        status: 'pending',
        payment_method: 'Bank Transfer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Update wallet balance in Supabase
      await updateWalletBalance(user.id, amount, 'debit');

      const newTransaction: Transaction = {
        id: txn.data?.id || `TXN${Date.now()}`,
        type: 'debit',
        amount: amount,
        description: `Withdrawal to ${bank?.bankName || 'Bank Account'}`,
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: 'Bank Transfer'
      };

      setTransactions([newTransaction, ...transactions]);
      setWalletBalance(walletBalance - amount);
      setPendingAmount(pendingAmount + amount);
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
      setSelectedBank('');

      // Show success message
      showNotification(`Withdrawal of ₹${amount} initiated successfully! It will be processed in 2-3 business days.`, 'success');
    } catch (error) {
      console.error('Withdrawal error:', error);
      showNotification('Failed to process withdrawal. Please try again.', 'error');
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          txn.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesStatus = filterStatus === 'all' || txn.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: any, icon: any } } = {
      success: { variant: 'default', icon: CheckCircle },
      pending: { variant: 'secondary', icon: Clock },
      failed: { variant: 'destructive', icon: XCircle }
    };
    
    const { variant, icon: Icon } = variants[status] || variants.success;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header hideAuthButtons={false} />
      
      <div className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-background via-background to-card border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/lawyer">
                  <Button variant="ghost" size="icon" className="hover:bg-card">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-body font-bold text-foreground">
                    Professional Wallet
                  </h1>
                  <p className="text-muted-foreground font-body mt-1">
                    Manage your earnings and withdrawals
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="border-border/50">
                  <Download className="mr-2 h-4 w-4" />
                  Export Statement
                </Button>
                <Button variant="outline" className="border-border/50">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Balance & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Balance Card */}
            <Card className="lg:col-span-2 border-0 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
              </div>
              <CardContent className="p-8 relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90 font-body">Available Balance</p>
                      <div className="flex items-center gap-3 mt-1">
                        {isBalanceVisible ? (
                          <h2 className="text-4xl font-body font-bold">{formatCurrency(walletBalance)}</h2>
                        ) : (
                          <h2 className="text-4xl font-body font-bold">₹ ••••••</h2>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-white/20 text-white"
                          onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                        >
                          {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Verified Account
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs opacity-90 mb-1">This Month</p>
                    <p className="text-2xl font-body font-semibold">{formatCurrency(totalEarningsThisMonth)}</p>
                    <p className="text-xs opacity-75 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +{monthlyGrowth}%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs opacity-90 mb-1">Withdrawn</p>
                    <p className="text-2xl font-body font-semibold">{formatCurrency(totalWithdrawn)}</p>
                    <p className="text-xs opacity-75 mt-1">Total lifetime</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs opacity-90 mb-1">Pending</p>
                    <p className="text-2xl font-body font-semibold">{formatCurrency(pendingAmount)}</p>
                    <p className="text-xs opacity-75 mt-1">Processing</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="flex-1 bg-white hover:bg-white/90 text-primary font-semibold">
                        <ArrowUpFromLine className="mr-2 h-5 w-5" />
                        Withdraw Funds
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-body">Withdraw Funds</DialogTitle>
                        <DialogDescription>
                          Withdraw your earnings to your registered bank account
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Withdrawal Amount</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount (Min: ₹500)"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="text-lg"
                          />
                          <p className="text-xs text-muted-foreground">
                            Available balance: {formatCurrency(walletBalance)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Bank Account</Label>
                          <Select value={selectedBank} onValueChange={setSelectedBank}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank account" />
                            </SelectTrigger>
                            <SelectContent>
                              {bankAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    <span>{account.bankName} - ••••{account.accountNumber.slice(-4)}</span>
                                    {account.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-secondary mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium mb-1">Processing Time</p>
                              <p className="text-muted-foreground">Withdrawals are processed within 2-3 business days</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleWithdraw} className="bg-primary hover:bg-primary/90">
                          Confirm Withdrawal
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30" onClick={() => window.location.href = '/dashboard/lawyer'}>
                    <BarChart3 className="mr-2 h-5 w-5" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Professional Stats */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-body">Professional Stats</CardTitle>
                <CardDescription>Your practice performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Consultations</p>
                      <p className="text-xl font-body font-semibold">{totalConsultations}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Fee</p>
                      <p className="text-xl font-body font-semibold">{formatCurrency(averageFee)}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="text-xl font-body font-semibold">5.0</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary">Excellent</Badge>
                </div>

                <Button variant="outline" className="w-full border-border/50 hover:bg-card" onClick={() => window.location.href = '/dashboard/lawyer'}>
                  <Activity className="mr-2 h-4 w-4" />
                  View Full Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bank Accounts */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-body">Registered Bank Accounts</CardTitle>
                  <CardDescription>Manage your bank accounts for withdrawals</CardDescription>
                </div>
                <Dialog open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Bank Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-body">Add Bank Account</DialogTitle>
                      <DialogDescription>
                        Add a new bank account for withdrawals
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Account Holder Name</Label>
                        <Input placeholder="Full name as per bank records" />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input type="number" placeholder="Enter account number" />
                      </div>
                      <div className="space-y-2">
                        <Label>IFSC Code</Label>
                        <Input placeholder="Enter IFSC code" />
                      </div>
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input placeholder="Enter bank name" />
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium mb-1">Secure & Verified</p>
                            <p className="text-muted-foreground">Your bank details are encrypted and securely stored</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddBankOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-primary hover:bg-primary/90">
                        Add Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{account.bankName}</p>
                          <p className="text-sm text-muted-foreground">{account.accountHolderName}</p>
                        </div>
                      </div>
                      {account.isDefault && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">Default</Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Account Number</span>
                        <span className="font-mono">••••••{account.accountNumber.slice(-4)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">IFSC Code</span>
                        <span className="font-mono">{account.ifscCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-body">Transaction History</CardTitle>
                  <CardDescription>Complete record of all your earnings and withdrawals</CardDescription>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
                      <Receipt className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-body font-semibold text-foreground mb-2">No Transactions Found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Your transactions will appear here'}
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            transaction.type === 'credit' 
                              ? 'bg-secondary/20' 
                              : 'bg-primary/20'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <ArrowDownToLine className="w-6 h-6 text-secondary" />
                            ) : (
                              <ArrowUpFromLine className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">{transaction.description}</h4>
                                {transaction.clientName && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    Client: {transaction.clientName}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className={`text-xl font-body font-semibold ${
                                  transaction.type === 'credit' ? 'text-secondary' : 'text-foreground'
                                }`}>
                                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Receipt className="w-3 h-3" />
                                <span className="font-mono">{transaction.id}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => copyToClipboard(transaction.id)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(transaction.date)}</span>
                              </div>
                              {transaction.paymentMethod && (
                                <div className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  <span>{transaction.paymentMethod}</span>
                                </div>
                              )}
                              {transaction.paytmTransactionId && (
                                <div className="flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  <span className="font-mono text-xs">{transaction.paytmTransactionId}</span>
                                </div>
                              )}
                              <div>{getStatusBadge(transaction.status)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {filteredTransactions.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                  </p>
                  <Button variant="outline" className="border-border/50 hover:bg-card">
                    <Download className="mr-2 h-4 w-4" />
                    Export Transactions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help & Security */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Security Features */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-body flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <CheckCircle className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Bank-Level Encryption</p>
                    <p className="text-xs text-muted-foreground">All transactions are encrypted with SSL/TLS</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <CheckCircle className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">PCI DSS Compliant</p>
                    <p className="text-xs text-muted-foreground">Paytm PCI DSS certified payment gateway</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <CheckCircle className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Secure Withdrawals</p>
                    <p className="text-xs text-muted-foreground">2-3 business days processing time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <CheckCircle className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Tax Documentation</p>
                    <p className="text-xs text-muted-foreground">Automatic income reports for filing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-body flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <h4 className="font-semibold text-sm mb-2">How do I withdraw funds?</h4>
                  <p className="text-xs text-muted-foreground">
                    Click "Withdraw Funds", enter the amount (min ₹500), select your bank account, and confirm. Funds will be transferred in 2-3 business days.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <h4 className="font-semibold text-sm mb-2">When do I receive consultation fees?</h4>
                  <p className="text-xs text-muted-foreground">
                    Consultation fees are credited to your wallet immediately after successful payment by the client.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <h4 className="font-semibold text-sm mb-2">Are there any withdrawal charges?</h4>
                  <p className="text-xs text-muted-foreground">
                    No, there are no charges for withdrawing funds to your registered bank account.
                  </p>
                </div>
                <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LawyerWalletPage;
