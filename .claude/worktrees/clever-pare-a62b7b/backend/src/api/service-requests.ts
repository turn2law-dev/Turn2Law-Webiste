import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/email';
import { getServiceReceivedEmail, getStatusUpdateEmail, getDocumentReceivedEmail } from '../utils/emailTemplates';

const router = Router();

// Initialize Supabase with service role for admin operations
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Admin emails from env
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Service code mapping
const SERVICE_CODES: Record<string, string> = {
    'GST Registration': 'GST',
    'GST Return Filing': 'GSTR',
    'LLP': 'LLP',
    'Private Limited': 'PVT',
    'Partnership': 'PRT',
    'OPC': 'OPC',
    'IEC': 'IEC',
};

// Status labels for email
const STATUS_LABELS: Record<string, string> = {
    'submitted': 'Submitted',
    'under_review': 'Under Review',
    'in_progress': 'In Progress',
    'on_hold': 'On Hold',
    'completed': 'Completed',
    'archived': 'Archived',
};

// Helper: Check if email is admin (Async check against DB)
const isWhitelistedAdmin = async (email: string): Promise<boolean> => {
    if (!email) return false;
    try {
        const { data, error } = await supabaseAdmin
            .from('admin_whitelist')
            .select('email')
            .eq('email', email.toLowerCase())
            .single();

        return !!data && !error;
    } catch (err) {
        console.error('Error checking admin whitelist:', err);
        return false;
    }
};

// Middleware to verify admin access via JWT
const verifyAdmin = async (req: Request, res: Response, next: Function) => {
    console.log('[VERIFY_ADMIN] Checking admin auth for:', req.path);
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        console.log('[VERIFY_ADMIN] Token present:', !!token);

        if (!token) {
            console.log('[VERIFY_ADMIN] BLOCKED: No token');
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; userId?: string };
        const userId = decoded.sub || decoded.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Invalid token structure' });
        }

        // Fetch user from Supabase to check email
        const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (error || !user || !user.email) {
            return res.status(403).json({ error: 'Invalid user' });
        }

        const isAdmin = await isWhitelistedAdmin(user.email);

        if (!isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Attach admin info to request for use in route
        (req as any).adminUser = user;
        next();
        return;
    } catch (error) {
        console.error('Admin verification failed:', error);
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
    }
};

// Email to admin when new request is created
const sendNewRequestNotification = async (request: any) => {
    // Fetch all admin emails from the whitelist to notify them
    const { data: admins } = await supabaseAdmin
        .from('admin_whitelist')
        .select('email');

    if (!admins || admins.length === 0) return;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #DF9C49;">🔔 New Service Request</h2>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Service Number:</strong> ${request.service_number}</p>
                <p><strong>Service Type:</strong> ${request.service_type}</p>
                <p><strong>Client:</strong> ${request.user_name || 'N/A'}</p>
                <p><strong>Email:</strong> ${request.user_email}</p>
                <p><strong>Phone:</strong> ${request.user_phone || 'N/A'}</p>
                <p><strong>Plan:</strong> ${request.plan || 'Basic'}</p>
            </div>
            <p>Login to the <a href="https://turn2law.tech/admin/services" style="color: #DF9C49;">Admin Panel</a> to manage this request.</p>
        </div>
    `;

    for (const admin of admins) {
        if (admin.email) {
            await sendEmail(admin.email, `New Service Request: ${request.service_number}`, html);
        }
    }
};

// Generate service number
// Generate service number
// Generate service number
const generateServiceNumber = async (serviceType: string): Promise<string> => {
    // Normalize service type mapping
    const normalizedType = Object.keys(SERVICE_CODES).find(key =>
        serviceType.toLowerCase().includes(key.toLowerCase())
    );
    const code = normalizedType ? SERVICE_CODES[normalizedType] : 'SVC';
    const prefix = `T2L-${code}-`;

    // Get the last service request with this specific prefix
    const { data } = await supabaseAdmin
        .from('service_requests')
        .select('service_number')
        .ilike('service_number', `${prefix}%`)
        .order('service_number', { ascending: false })
        .limit(1)
        .single();

    let nextNum = 1;

    if (data && data.service_number) {
        // Parse the numeric part from the end
        const parts = data.service_number.split('-');
        const lastNumStr = parts[parts.length - 1];
        const lastNum = parseInt(lastNumStr, 10);

        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }

    return `${prefix}${String(nextNum).padStart(5, '0')}`;
};

// POST /api/service-requests - Create new request (client)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { userId, userEmail, userName, userPhone, serviceType, plan, formData } = req.body;

        if (!userId || !userEmail || !serviceType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const serviceNumber = await generateServiceNumber(serviceType);

        const timeline = [{
            status: 'submitted',
            timestamp: new Date().toISOString(),
        }];

        const { data, error } = await supabaseAdmin
            .from('service_requests')
            .insert({
                service_number: serviceNumber,
                user_id: userId,
                user_email: userEmail,
                user_name: userName,
                user_phone: userPhone,
                service_type: serviceType,
                status: 'submitted',
                plan: plan || null,
                form_data: formData || {},
                timeline,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating service request:', error);
            return res.status(500).json({ error: 'Failed to create service request' });
        }

        // Notifications (fire and forget - don't let email failures crash the request)
        try {
            await sendNewRequestNotification(data);
        } catch (emailErr) {
            console.error('Failed to send admin notification:', emailErr);
        }

        // Send confirmation email to client using new template
        const emailHtml = getServiceReceivedEmail(userName, serviceType, serviceNumber);
        sendEmail(userEmail, `Service Request Received - ${serviceNumber}`, emailHtml)
            .catch(err => console.error('Failed to send client email:', err));

        console.log(`[Service Request] New request: ${serviceNumber}`);

        return res.status(201).json({
            success: true,
            serviceRequest: data,
            message: 'Service request created successfully',
        });
    } catch (error) {
        console.error('Error in POST /service-requests:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/service-requests - Get requests
// Admin: returns all if requesting with admin token/email
// Client: returns only theirs
router.get('/', async (req: Request, res: Response) => {
    try {
        const { userId, status } = req.query;
        let isAdminRequest = false;

        // Check for Admin via JWT (preferred)
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
                // Use admin client to verify user
                const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(decoded.userId);
                if (user && user.email) {
                    isAdminRequest = await isWhitelistedAdmin(user.email);
                }
            } catch (e) {
                // Ignore token error, might be client
            }
        }

        // Fallback: Check for Admin via prompt email query (legacy/simple check)
        const { email } = req.query;
        if (!isAdminRequest && email) {
            const isWhitelisted = await isWhitelistedAdmin(email as string);
            if (isWhitelisted) {
                isAdminRequest = true;
            }
        }

        let query = supabaseAdmin.from('service_requests').select('*');

        if (isAdminRequest) {
            if (status && status !== 'all') {
                query = query.eq('status', status);
            }
        } else if (userId) {
            query = query.eq('user_id', userId);
        } else {
            return res.status(403).json({ error: 'Unauthorized: userId or Admin access required' });
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching service requests:', error);
            return res.status(500).json({ error: 'Failed to fetch service requests' });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error in GET /service-requests:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/service-requests/:id - Get single request
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('service_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Service request not found' });
        }
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/service-requests/:id - Update request (Protected Admin Route)
router.put('/:id', verifyAdmin, async (req: Request, res: Response) => {
    console.log('='.repeat(80));
    console.log('[PUT] Received request to update service request:', req.params.id);
    console.log('[PUT] Body:', req.body);
    try {
        const { id } = req.params;
        const { status, estimatedCompletion, adminNotes, notifyClient } = req.body;
        // adminUser is attached by middleware

        const { data: current, error: fetchError } = await supabaseAdmin
            .from('service_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !current) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        const updates: Record<string, any> = {};
        let statusChanged = false;

        if (status && status !== current.status) {
            updates.status = status;
            statusChanged = true;
            const timeline = current.timeline || [];
            timeline.push({
                status,
                timestamp: new Date().toISOString(),
            });
            updates.timeline = timeline;
        }

        if (estimatedCompletion) {
            updates.estimated_completion = estimatedCompletion;
        }

        if (adminNotes !== undefined) {
            updates.admin_notes = adminNotes;
        }

        const { data, error } = await supabaseAdmin
            .from('service_requests')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase Update Error:', error); // Critical debug log
            return res.status(500).json({ error: 'Failed to update service request', details: error });
        }

        if (statusChanged) {
            if (notifyClient !== false) { // Default to true if undefined
                // Send status update email using template
                console.log('='.repeat(80));
                console.log('[STATUS UPDATE] Status changed, sending email to:', data.user_email);
                console.log('[STATUS UPDATE] New status:', status);
                const emailHtml = getStatusUpdateEmail(data.user_name, data.service_type, data.service_number, status, adminNotes);
                sendEmail(data.user_email, `Status Update - ${data.service_number}`, emailHtml)
                    .then(() => console.log('[STATUS UPDATE] Email sent successfully!'))
                    .catch(err => console.error('[STATUS UPDATE] Failed to send email:', err));
            } else {
                console.log('[STATUS UPDATE] Email notification disabled by admin. Skipping email.');
            }
        } else {
            console.log('[STATUS UPDATE] Status not changed, skipping email');
        }

        return res.json({
            success: true,
            serviceRequest: data,
            message: 'Service request updated successfully',
        });
    } catch (error) {
        console.error('Error in PUT /service-requests/:id:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/service-requests/:id/documents - Add document reference (Client Upload)
router.post('/:id/documents', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, url, path, type, uploadedAt } = req.body;

        if (!name || !url) {
            return res.status(400).json({ error: 'Missing document details' });
        }

        // Fetch current request
        const { data: current, error: fetchError } = await supabaseAdmin
            .from('service_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !current) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Update form_data to include the new document
        const currentFormData = current.form_data || {};
        const currentDocuments = currentFormData.documents || [];

        const newDocument = {
            name,
            url,
            path, // Critical for private bucket access
            type,
            uploadedAt: uploadedAt || new Date().toISOString()
        };

        const updatedFormData = {
            ...currentFormData,
            documents: [...currentDocuments, newDocument]
        };

        // Update the record
        const { data, error } = await supabaseAdmin
            .from('service_requests')
            .update({ form_data: updatedFormData })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error adding document:', error);
            return res.status(500).json({ error: 'Failed to add document reference' });
        }

        // Notify Admin (Optional but good practice)
        // const adminEmails = ADMIN_EMAILS.filter(e => e);
        // for (const email of adminEmails) {
        //     await sendEmail(email, `New Document Uploaded: ${current.service_number}`, `Client uploaded ${name}. View in Admin Panel.`);
        // }

        // Send confirmation to client
        const emailHtml = getDocumentReceivedEmail(current.user_name || 'Client', current.service_type, name);
        sendEmail(current.user_email, `Document Received - ${current.service_number}`, emailHtml)
            .catch(err => console.error('Failed to send doc email:', err));

        return res.json({
            success: true,
            message: 'Document added successfully',
            document: newDocument,
            serviceRequest: data
        });

    } catch (error) {
        console.error('Error in POST /service-requests/:id/documents:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/service-requests/check-admin - Check if user is admin
// GET /api/service-requests/check-admin - Check if user is admin
router.get('/check-admin/:email', async (req: Request, res: Response) => {
    const { email } = req.params;
    const isAdmin = await isWhitelistedAdmin(email);
    return res.json({ isAdmin });
});

export default router;
