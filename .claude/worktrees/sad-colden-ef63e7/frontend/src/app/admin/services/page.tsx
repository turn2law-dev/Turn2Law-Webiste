"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserProfile, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Search,
    Filter,
    Calendar,
    User,
    Phone,
    Mail,
    Building,
    RefreshCw,
    Archive,
} from "lucide-react";

interface ServiceRequest {
    id: string;
    service_number: string;
    user_id: string;
    user_email: string;
    user_name: string;
    user_phone: string;
    service_type: string;
    status: 'submitted' | 'under_review' | 'in_progress' | 'on_hold' | 'completed' | 'archived';
    plan: string;
    form_data: Record<string, any>;
    timeline: { status: string; timestamp: string }[];
    estimated_completion: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

const STATUS_CONFIG = {
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FileText },
    under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Loader2 },
    on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    archived: { label: 'Archived', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Archive },
};

import { useToast } from "@/hooks/use-toast";

export default function AdminServicesPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updating, setUpdating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [archivingId, setArchivingId] = useState<string | null>(null);

    // Form state for detail view
    const [editStatus, setEditStatus] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [notifyClient, setNotifyClient] = useState(true);

    useEffect(() => {
        checkAdminAndLoad();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [requests, searchQuery, statusFilter]);

    const checkAdminAndLoad = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // Check if admin
            const adminCheck = await fetch(`${apiUrl}/api/service-requests/check-admin/${currentUser.email}`);
            const { isAdmin: adminStatus } = await adminCheck.json();

            if (!adminStatus) {
                router.push('/dashboard/client');
                return;
            }

            setIsAdmin(true);
            await loadRequests(currentUser.email!);
        } catch (error) {
            console.error('Error checking admin:', error);
            router.push('/login');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };



    const handleViewDocument = async (doc: any) => {
        try {
            if (doc.path) {
                const { data, error } = await supabase.storage
                    .from("documents")
                    .createSignedUrl(doc.path, 60);

                if (error) throw error;
                window.open(data.signedUrl, '_blank');
            } else {
                window.open(doc.url, '_blank');
            }
        } catch (err) {
            console.error("Error opening document:", err);
            toast({
                title: "Error",
                description: "Could not open document.",
                variant: "destructive",
            });
        }
    };

    const loadRequests = async (adminEmail: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/service-requests?email=${adminEmail}`);
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const filterRequests = () => {
        let filtered = [...requests];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.service_number.toLowerCase().includes(query) ||
                r.user_name?.toLowerCase().includes(query) ||
                r.user_email.toLowerCase().includes(query) ||
                r.service_type.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        } else {
            // By default, hide archived requests
            filtered = filtered.filter(r => r.status !== 'archived');
        }

        setFilteredRequests(filtered);
    };

    const openDetail = (request: ServiceRequest) => {
        setSelectedRequest(request);
        setEditStatus(request.status);
        setEditDate(request.estimated_completion || '');
        setEditNotes(request.admin_notes || '');
        setNotifyClient(true); // Default to sending email
        setIsDetailOpen(true);
    };

    const handleArchive = async (e: React.MouseEvent, request: ServiceRequest) => {
        e.stopPropagation(); // Prevent opening detail view
        if (!confirm('Are you sure you want to archive this request?')) return;

        setArchivingId(request.id);
        try {
            const currentUser = await getCurrentUser();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${apiUrl}/api/service-requests/${request.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    email: currentUser?.email,
                    status: 'archived',
                }),
            });

            if (response.ok) {
                const { serviceRequest } = await response.json();
                setRequests(prev => prev.map(r => r.id === serviceRequest.id ? serviceRequest : r));
                // If detailed view is open and it's this request, close it or update it
                if (selectedRequest?.id === request.id) {
                    setIsDetailOpen(false);
                }
            } else {
                const err = await response.json();
                toast({
                    title: "Error",
                    description: `Failed to archive request: ${err.error || 'Unknown error'}`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error archiving:', error);
            toast({
                title: "Error",
                description: "Error archiving request: Network or Server Error",
                variant: "destructive",
            });
        } finally {
            setArchivingId(null);
        }
    };

    const saveChanges = async () => {
        if (!selectedRequest) return;

        setUpdating(true);
        try {
            const currentUser = await getCurrentUser();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${apiUrl}/api/service-requests/${selectedRequest.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    email: currentUser?.email,
                    status: editStatus,
                    estimatedCompletion: editDate || null,
                    adminNotes: editNotes,
                    notifyClient,
                }),
            });

            if (response.ok) {
                const { serviceRequest } = await response.json();
                setRequests(prev => prev.map(r => r.id === serviceRequest.id ? serviceRequest : r));
                setSelectedRequest(serviceRequest);
                toast({
                    title: "Success",
                    description: "Changes saved successfully!",
                    className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to save changes",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error saving:', error);
            toast({
                title: "Error",
                description: "Error saving changes",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Service Requests</h1>
                            <p className="text-sm text-muted-foreground">Admin Panel - Manage all service requests</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setRefreshing(true);
                                checkAdminAndLoad();
                            }}
                            className="gap-2"
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const count = requests.filter(r => r.status === key).length;
                        const Icon = config.icon;
                        return (
                            <Card
                                key={key}
                                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === key ? 'ring-2 ring-primary' : ''}`}
                                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold">{count}</p>
                                            <p className="text-xs text-muted-foreground">{config.label}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${config.color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by service number, client name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <Card className="border-border/50">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Service #</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Service</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                                        <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No service requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((request) => {
                                            const statusConfig = STATUS_CONFIG[request.status];
                                            const isArchived = request.status === 'archived';
                                            return (
                                                <tr
                                                    key={request.id}
                                                    className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                                                    onClick={() => openDetail(request)}
                                                >
                                                    <td className="p-4">
                                                        <span className="font-mono font-semibold text-primary">
                                                            {request.service_number}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="font-medium">{request.user_name || 'N/A'}</p>
                                                            <p className="text-sm text-muted-foreground">{request.user_email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm">{request.service_type}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                                            {statusConfig.icon && <statusConfig.icon className="h-3 w-3" />}
                                                            {statusConfig.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-muted-foreground">
                                                        {formatDate(request.created_at)}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="sm">
                                                                View
                                                            </Button>
                                                            {!isArchived && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                                    title="Archive Request"
                                                                    onClick={(e) => handleArchive(e, request)}
                                                                    disabled={archivingId === request.id}
                                                                >
                                                                    {archivingId === request.id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Archive className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedRequest && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    <span className="font-mono text-primary">{selectedRequest.service_number}</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[selectedRequest.status].color}`}>
                                        {STATUS_CONFIG[selectedRequest.status].label}
                                    </span>
                                    {selectedRequest.status !== 'archived' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-auto text-muted-foreground hover:text-red-500 gap-2 text-xs h-8"
                                            onClick={(e) => handleArchive(e, selectedRequest)}
                                        >
                                            <Archive className="h-3.5 w-3.5" />
                                            Archive
                                        </Button>
                                    )}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedRequest.service_type} • Submitted {formatDate(selectedRequest.created_at)}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {/* Client Info */}
                                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Client Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedRequest.user_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedRequest.user_email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedRequest.user_phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <span className="block">{selectedRequest.form_data?.businessName || selectedRequest.form_data?.companyName || 'N/A'}</span>
                                                <span className="text-xs text-muted-foreground block">{selectedRequest.form_data?.businessActivity || 'Activity N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 col-span-2 border-t border-border/50 pt-2 mt-2">
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">Plan:</span>
                                            <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded text-sm capitalize">
                                                {selectedRequest.plan || 'Basic'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Data */}
                                {selectedRequest.form_data && Object.keys(selectedRequest.form_data).length > 0 && (
                                    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Form Details</h3>
                                        <div className="grid gap-2">
                                            {Object.entries(selectedRequest.form_data)
                                                .filter(([key]) => key !== 'documents')
                                                .map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                        <span className="font-medium">{String(value) || 'N/A'}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Submitted Documents */}
                                {selectedRequest.form_data?.documents && selectedRequest.form_data.documents.length > 0 && (
                                    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Submitted Documents</h3>
                                        <div className="space-y-2">
                                            {selectedRequest.form_data.documents.map((doc: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-background rounded-lg border border-border">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        <div>
                                                            <p className="font-medium text-sm">{doc.name}</p>
                                                            <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)}>
                                                        View
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Controls */}
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h3 className="font-semibold">Update Request</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Status</label>
                                            <Select value={editStatus} onValueChange={setEditStatus}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Estimated Completion</label>
                                            <Input
                                                type="date"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center justify-between">
                                            Status Update Message
                                            <span className="text-xs text-muted-foreground font-normal">Sent in email to client</span>
                                        </label>
                                        <Textarea
                                            value={editNotes}
                                            onChange={(e) => setEditNotes(e.target.value)}
                                            placeholder="e.g. Please upload the pending documents..."
                                            rows={3}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Notify Client via Email</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Send an email notification about this update
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifyClient}
                                            onCheckedChange={setNotifyClient}
                                        />
                                    </div>

                                    <Button
                                        onClick={saveChanges}
                                        disabled={updating}
                                        className="w-full"
                                    >
                                        {updating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </Button>
                                </div>

                                {/* Timeline */}
                                {selectedRequest.timeline && selectedRequest.timeline.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-border">
                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Timeline</h3>
                                        <div className="space-y-2">
                                            {selectedRequest.timeline.map((entry, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                    <span className="font-medium capitalize">{entry.status.replace('_', ' ')}</span>
                                                    <span className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
