import { getCurrentUser, getUserProfile } from '@/lib/supabase';

export interface ServiceSubmission {
    userId: string;
    userEmail: string;
    userName?: string;
    userPhone?: string;
    serviceType: string;
    plan?: string;
    formData: Record<string, any>;
}

export interface AuthResult {
    user: any;
    profile: any;
    isAuthenticated: boolean;
}

/**
 * Check if user is authenticated and get their info
 */
export async function checkServiceAuth(): Promise<AuthResult> {
    const user = await getCurrentUser();

    if (!user) {
        return { user: null, profile: null, isAuthenticated: false };
    }

    const profile = await getUserProfile(user.id);

    return {
        user,
        profile,
        isAuthenticated: true,
    };
}

/**
 * Submit a service request to the backend
 */
export async function submitServiceRequest(data: ServiceSubmission): Promise<{
    success: boolean;
    error?: string;
    serviceRequest?: any;
}> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        const response = await fetch(`${apiUrl}/api/service-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            return { success: true, serviceRequest: result.serviceRequest };
        } else {
            return { success: false, error: result.error || 'Failed to submit request' };
        }
    } catch (error) {
        console.error('Error submitting service request:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}
