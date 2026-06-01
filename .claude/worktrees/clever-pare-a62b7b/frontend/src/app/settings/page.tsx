"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input'; // Assuming Input component exists
import { Settings as SettingsIcon, Shield, Bell, Save, X } from 'lucide-react';
import { getClientStats } from '@/lib/supabase';
import { useNotification } from '@/contexts/notification-context';

interface User {
    id: string;
    email: string;
    fullName: string;
    userType: string;
    city?: string;
    createdAt: string;
}

interface ClientStats {
    totalConsultations: number;
    activeCases: number;
    walletBalance: number;
    totalSpent: number;
}

export default function SettingsPage() {
    const router = useRouter();
    const { showNotification } = useNotification();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [resetLoading, setResetLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ fullName: '', city: '' });
    const [saveLoading, setSaveLoading] = useState(false);

    const [stats, setStats] = useState<ClientStats>({
        totalConsultations: 0,
        activeCases: 0,
        walletBalance: 0,
        totalSpent: 0
    });

    useEffect(() => {
        loadSettingsData();
    }, []);

    const loadSettingsData = async () => {
        try {
            console.log('[Settings] Checking Supabase Auth session...');

            // Import Supabase auth functions
            const { getSession, getUserProfile } = await import('@/lib/supabase-auth');

            // Check Supabase session
            const session = await getSession();

            if (!session || !session.user) {
                console.log('[Settings] No active session, redirecting to login');
                router.push('/login');
                return;
            }

            // Fetch user profile from database
            const profile = await getUserProfile(session.user.id);

            if (!profile) {
                console.error('[Settings] Profile not found');
                router.push('/login');
                return;
            }

            // Set user data
            setUser({
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name,
                userType: profile.user_type,
                city: profile.city,
                createdAt: profile.created_at
            });

            // Fetch stats if client
            if (profile.user_type === 'client') {
                const clientStats = await getClientStats(profile.id);
                setStats(clientStats);
            }

        } catch (error) {
            console.error('[Settings] Error loading settings:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        if (user) {
            setEditForm({
                fullName: user.fullName || '',
                city: user.city || ''
            });
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({ fullName: '', city: '' });
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setSaveLoading(true);
        try {
            const { updateUserProfile } = await import('@/lib/supabase-auth');

            const updates = {
                full_name: editForm.fullName,
                city: editForm.city
            };

            await updateUserProfile(user.id, updates);

            // Update local state
            setUser(prev => prev ? {
                ...prev,
                fullName: editForm.fullName,
                city: editForm.city
            } : null);

            setIsEditing(false);
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile. Please try again.', 'error');
        } finally {
            setSaveLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email || resetLoading) return;

        const userEmail = user.email; // Capture email before async
        setResetLoading(true);
        try {
            const { resetPasswordRequest } = await import('@/lib/supabase-auth');
            await resetPasswordRequest(userEmail);
            showNotification('Verification code sent! Redirecting...', 'success');
            // Redirect to reset-password page with email prefilled
            setTimeout(() => {
                window.location.href = `/reset-password?email=${encodeURIComponent(userEmail)}`;
            }, 1000);
        } catch (error: any) {
            console.error('Error sending reset code:', error);
            // Show more specific error message
            const errorMsg = error?.message || 'Failed to send verification code. Please try again.';
            showNotification(errorMsg, 'error');
            setResetLoading(false);
        }
    };

    const handleNotificationSettings = () => {
        showNotification('Notification settings will be available in the next update!', 'info');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading settings...</p>
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-body font-bold">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your profile, security, and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-body">Profile Information</CardTitle>
                                        <p className="text-sm text-muted-foreground font-body">Manage your personal information and preferences</p>
                                    </div>
                                    {isEditing && (
                                        <Badge variant="outline" className="text-primary border-primary/50">Editing Mode</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.fullName}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                                                className="bg-muted/50"
                                            />
                                        ) : (
                                            <p className="text-lg font-medium">{user.fullName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <p className="text-lg font-medium text-muted-foreground/80">{user.email}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">City</label>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.city}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                                className="bg-muted/50"
                                                placeholder="Enter your city"
                                            />
                                        ) : (
                                            <p className="text-lg font-medium">{user.city || 'Not specified'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                                        <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30 capitalize block w-fit">
                                            {user.userType} Account
                                        </Badge>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border/50 flex gap-3">
                                    {isEditing ? (
                                        <>
                                            <Button onClick={handleSaveProfile} disabled={saveLoading} className="min-w-[120px]">
                                                {saveLoading ? (
                                                    <span className="flex items-center">
                                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                                        Saving...
                                                    </span>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline" onClick={handleCancelEdit} disabled={saveLoading}>
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button size="lg" onClick={handleEditClick}>
                                            <SettingsIcon className="mr-2 h-5 w-5" />
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-body">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Member Since</span>
                                    <span className="font-medium">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Consultations</span>
                                    <span className="font-medium">{stats.totalConsultations}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Active Cases</span>
                                    <span className="font-medium">{stats.activeCases}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-body">Account Security</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handlePasswordReset}
                                    disabled={resetLoading}
                                >
                                    <Shield className="mr-2 h-4 w-4" />
                                    {resetLoading ? 'Sending...' : 'Change Password'}
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={handleNotificationSettings}>
                                    <Bell className="mr-2 h-4 w-4" />
                                    Notification Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
