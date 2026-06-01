"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/contexts/notification-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  History,
  FileText,
  ExternalLink
} from 'lucide-react';
import Header from '@/components/layout/header';
import { 
  getCurrentUser, 
  getUserProfile, 
  getWalletBalance, 
  getTransactions,
  createTransaction,
  updateWalletBalance,
  type WalletBalance,
  type Transaction as SupabaseTransaction
} from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  fullName: string;
  userType: string;
  city?: string;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  category: string;
  paymentMethod?: string;
  paytmOrderId?: string;
  paytmTransactionId?: string;
}

interface WalletData {
  balance: number;
  totalEarnings: number;
  totalSpent: number;
  pendingAmount: number;
}

const ClientWallet = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    totalEarnings: 0,
    totalSpent: 0,
    pendingAmount: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        // Check authentication using Supabase Auth
        console.log('[Wallet] Checking Supabase Auth session...');
        const { getSession, getUserProfile } = await import('@/lib/supabase-auth');
        
        const session = await getSession();
        
        if (!session || !session.user) {
          console.log('[Wallet] No active session, redirecting to login');
          router.push('/login');
          return;
        }
        
        console.log('[Wallet] User authenticated:', session.user.id);
        
        // Get user profile from Supabase
        const profile = await getUserProfile(session.user.id);
        
        if (!profile) {
          console.log('[Wallet] Profile not found, redirecting to login');
          router.push('/login');
          return;
        }
        
        console.log('[Wallet] User profile loaded:', profile);
        
        // Check user type
        if (profile.user_type !== 'client') {
          console.log('[Wallet] User is not a client, redirecting to lawyer dashboard');
          router.push('/dashboard/lawyer');
          return;
        }
        
        // Set user state with profile data
        setUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          userType: profile.user_type,
          city: profile.city || undefined
        });
        console.log('[Wallet] User set successfully from Supabase profile');
        
        // Fetch real data from Supabase using the user ID
        const userId = session.user.id;
        console.log('[Wallet] Fetching wallet data for userId:', userId);
        
        if (userId) {
          // Get wallet balance from Supabase
          const wallet = await getWalletBalance(userId);
          if (wallet) {
            console.log('[Wallet] Wallet balance loaded:', wallet);
            setWalletData({
              balance: wallet.balance,
              totalEarnings: wallet.total_earnings,
              totalSpent: wallet.total_spent,
              pendingAmount: wallet.pending_amount
            });
          } else {
            console.log('[Wallet] No wallet data found for user');
          }

          // Get transactions from Supabase
          const txns = await getTransactions(userId);
          console.log('[Wallet] Transactions loaded:', txns.length);
          const formattedTransactions: Transaction[] = txns.map((txn: SupabaseTransaction) => ({
            id: txn.id,
            type: txn.type,
            amount: txn.amount,
            description: txn.description,
            status: txn.status,
            date: txn.created_at,
            category: txn.description.includes('Top-up') ? 'Top-up' : 
                     txn.description.includes('Consultation') ? 'Service' : 
                     txn.description.includes('Withdrawal') ? 'Withdrawal' : 'Other',
            paymentMethod: txn.payment_method || 'Paytm',
            paytmOrderId: txn.razorpay_order_id, // Reuse field for Paytm Order ID
            paytmTransactionId: txn.razorpay_payment_id // Reuse field for Paytm Transaction ID
          }));
          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error('[Wallet] Error loading wallet data:', error);
        // Don't redirect on error, just show empty state
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, []);

  const handleAddMoney = async () => {
    const amount = parseFloat(addMoneyAmount);
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    if (amount < 100) {
      showNotification('Minimum amount to add is ₹100', 'error');
      return;
    }

    if (amount > 100000) {
      showNotification('Maximum amount per transaction is ₹1,00,000', 'error');
      return;
    }

    if (!user) return;

    setProcessingPayment(true);

    try {
      // Call backend to initiate Paytm payment
      const response = await fetch('/api/paytm/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: amount,
          email: user.email,
          phone: '', // Add phone if available
          orderType: 'WALLET_TOPUP'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      // Create pending transaction in Supabase
      const pendingTxn = await createTransaction({
        user_id: user.id,
        type: 'credit',
        amount: amount,
        description: 'Wallet Top-up',
        status: 'pending',
        payment_method: 'Paytm',
        razorpay_order_id: data.orderId, // Using this field for Paytm Order ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Redirect to Paytm payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // For testing: simulate successful payment
        showNotification('Paytm payment gateway is being set up. For now, simulating successful payment.', 'info');
        
        // Update transaction to success
        const newTransaction: Transaction = {
          id: pendingTxn.data?.id || Date.now().toString(),
          type: 'credit',
          amount: amount,
          description: 'Wallet Top-up',
          status: 'success',
          date: new Date().toISOString(),
          category: 'Top-up',
          paymentMethod: 'Paytm',
          paytmOrderId: data.orderId,
          paytmTransactionId: `PTM${Date.now()}`
        };

        // Update wallet balance in Supabase
        await updateWalletBalance(user.id, amount, 'credit');

        setTransactions(prev => [newTransaction, ...prev]);
        setWalletData(prev => ({
          ...prev,
          balance: prev.balance + amount,
          totalEarnings: prev.totalEarnings + amount
        }));

        setAddMoneyAmount('');
        setIsAddMoneyOpen(false);
        showNotification(`₹${amount} added successfully to your wallet!`, 'success');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showNotification('Failed to process payment. Please try again.', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    if (amount > walletData.balance) {
      showNotification('Insufficient balance', 'error');
      return;
    }

    if (amount < 500) {
      showNotification('Minimum withdrawal amount is ₹500', 'error');
      return;
    }

    if (!user) return;

    try {
      // Create withdrawal transaction in Supabase
      const txn = await createTransaction({
        user_id: user.id,
        type: 'debit',
        amount: amount,
        description: 'Withdrawal to Bank Account',
        status: 'pending',
        payment_method: 'Bank Transfer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Update wallet balance in Supabase (deduct from balance, add to pending)
      await updateWalletBalance(user.id, amount, 'debit');

      const newTransaction: Transaction = {
        id: txn.data?.id || Date.now().toString(),
        type: 'debit',
        amount: amount,
        description: 'Withdrawal to Bank Account',
        status: 'pending',
        date: new Date().toISOString(),
        category: 'Withdrawal',
        paymentMethod: 'Bank Transfer'
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance - amount,
        pendingAmount: prev.pendingAmount + amount
      }));

      setWithdrawAmount('');
      setIsWithdrawOpen(false);
      showNotification(`Withdrawal request for ₹${amount} submitted successfully. It will be processed within 2-3 business days.`, 'success');
    } catch (error) {
      console.error('Withdrawal error:', error);
      showNotification('Failed to process withdrawal. Please try again.', 'error');
    }
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const statusMatch = filterStatus === 'all' || transaction.status === filterStatus;
      const typeMatch = filterType === 'all' || transaction.type === filterType;
      return statusMatch && typeMatch;
    });
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

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'credit') {
      return <ArrowDownToLine className="h-5 w-5 text-green-500" />;
    }
    return <ArrowUpFromLine className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

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
      {/* Main Header */}
      <Header hideAuthButtons={false} />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border/50 pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/client" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-body font-bold text-foreground">
                    My Wallet
                  </h1>
                  <p className="text-muted-foreground font-body">Manage your funds and transactions</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Add Money to Wallet
                    </DialogTitle>
                    <DialogDescription>
                      Add funds to your wallet using Paytm secure payment gateway
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={addMoneyAmount}
                        onChange={(e) => setAddMoneyAmount(e.target.value)}
                        min="100"
                        max="100000"
                      />
                      <p className="text-xs text-muted-foreground">Min: ₹100 | Max: ₹1,00,000 per transaction</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Quick Select</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {quickAmounts.map(amount => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setAddMoneyAmount(amount.toString())}
                            className="font-semibold"
                          >
                            ₹{amount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-foreground mb-1">100% Secure Payment</p>
                          <p className="text-muted-foreground text-xs">
                            Your payment is processed securely through Paytm with bank-level encryption
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddMoneyOpen(false);
                        setAddMoneyAmount('');
                      }}
                      disabled={processingPayment}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddMoney}
                      disabled={processingPayment || !addMoneyAmount}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {processingPayment ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Proceed to Pay
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10 font-semibold">
                    <ArrowUpFromLine className="mr-2 h-5 w-5" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ArrowUpFromLine className="h-5 w-5 text-secondary" />
                      Withdraw to Bank
                    </DialogTitle>
                    <DialogDescription>
                      Withdraw funds from your wallet to your bank account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Available Balance</span>
                        <span className="text-xl font-semibold text-foreground">₹{walletData.balance.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Withdrawal Amount (₹)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min="500"
                        max={walletData.balance}
                      />
                      <p className="text-xs text-muted-foreground">
                        Min: ₹500 | Available: ₹{walletData.balance.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-foreground mb-1">Processing Time</p>
                          <p className="text-muted-foreground text-xs">
                            Withdrawals are processed within 2-3 business days to your registered bank account
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsWithdrawOpen(false);
                        setWithdrawAmount('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      <Banknote className="mr-2 h-4 w-4" />
                      Request Withdrawal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Wallet Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/50 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
            </div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <Zap className="w-5 h-5 opacity-80" />
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Wallet Balance</p>
                <p className="text-3xl font-body font-bold">₹{walletData.balance.toFixed(2)}</p>
                <p className="text-xs opacity-80 mt-2">Available for use</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <ArrowDownToLine className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Received</p>
                <p className="text-3xl font-body font-semibold text-foreground">₹{walletData.totalEarnings.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-2">+15% this month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-red-500" />
                </div>
                <ArrowUpFromLine className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-3xl font-body font-semibold text-foreground">₹{walletData.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">On legal services</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <RefreshCw className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Amount</p>
                <p className="text-3xl font-body font-semibold text-foreground">₹{walletData.pendingAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">Being processed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-body">Quick Actions</CardTitle>
            <CardDescription>Common wallet operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col justify-center space-y-2 hover:bg-primary/10 hover:border-primary"
                onClick={() => setIsAddMoneyOpen(true)}
              >
                <Plus className="w-6 h-6 text-primary" />
                <span className="font-semibold">Add Money</span>
                <span className="text-xs text-muted-foreground">Top-up wallet</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col justify-center space-y-2 hover:bg-secondary/10 hover:border-secondary"
                onClick={() => setIsWithdrawOpen(true)}
              >
                <ArrowUpFromLine className="w-6 h-6 text-secondary" />
                <span className="font-semibold">Withdraw</span>
                <span className="text-xs text-muted-foreground">To bank account</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col justify-center space-y-2 hover:bg-card"
                asChild
              >
                <Link href="/consult">
                  <CreditCard className="w-6 h-6" />
                  <span className="font-semibold">Pay Lawyer</span>
                  <span className="text-xs text-muted-foreground">For consultation</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col justify-center space-y-2 hover:bg-card"
              >
                <Receipt className="w-6 h-6" />
                <span className="font-semibold">Invoices</span>
                <span className="text-xs text-muted-foreground">Download bills</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-body">Payment Methods</CardTitle>
            <CardDescription>Manage your payment options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Paytm Payment Gateway</p>
                    <p className="text-sm text-muted-foreground">Cards, UPI, Paytm Wallet & More</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold">Wallet Balance</p>
                    <p className="text-sm text-muted-foreground">Use wallet for instant payments</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-body">Transaction History</CardTitle>
                <CardDescription>View all your wallet transactions</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getFilteredTransactions().length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No Transactions Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {filterStatus !== 'all' || filterType !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Your transactions will appear here'}
                  </p>
                </div>
              ) : (
                getFilteredTransactions().map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {getTransactionIcon(transaction)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{transaction.description}</p>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {transaction.paymentMethod || 'N/A'}
                          </span>
                          {transaction.paytmTransactionId && (
                            <span className="flex items-center gap-1 text-xs">
                              <FileText className="w-3 h-3" />
                              {transaction.paytmTransactionId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {transaction.category}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {getFilteredTransactions().length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="outline">
                  Load More Transactions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Features & Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-body font-semibold mb-2">100% Secure</h3>
              <p className="text-sm text-muted-foreground">
                Your funds are protected with bank-level security and encryption
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-body font-semibold mb-2">Instant Payments</h3>
              <p className="text-sm text-muted-foreground">
                Make quick payments for legal services without delays
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-body font-semibold mb-2">Rewards Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Earn cashback and rewards on wallet transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-body font-semibold text-lg mb-2">Need Help with Your Wallet?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our support team is available 24/7 to assist you with any wallet-related queries or issues.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View FAQ
                    </Button>
                    <Button variant="outline" size="sm">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientWallet;
