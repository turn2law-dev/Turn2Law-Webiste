import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Send an email using Resend API
 * @param to Recipient email
 * @param subject Email subject
 * @param htmlContent HTML content of the email
 * @returns Response data from Resend
 */
export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
    try {
        console.log('='.repeat(80));
        console.log('[EMAIL] Sending email to:', to);
        console.log('[EMAIL] Subject:', subject);
        console.log('[EMAIL] Resend API Key configured:', !!RESEND_API_KEY);

        // If no API key is configured, just log in dev mode
        if (!resend) {
            console.warn('[EMAIL] WARNING: RESEND_API_KEY is not set. Email will not be sent.');
            if (process.env.NODE_ENV === 'development') {
                console.log('[EMAIL] Dev Mode: Simulating email send success.');
                return { id: 'dev-mock-id', success: true };
            }
            return { success: false, error: 'Misconfigured API Key' };
        }

        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Turn2Law <onboarding@resend.dev>', // Default testing sender, change to verified domain in prod
            to: [to],
            subject: subject,
            html: htmlContent,
        });

        if (data.error) {
            console.error('[EMAIL] Resend API error:', data.error);
            throw new Error(`Resend API error: ${data.error.message}`);
        }

        console.log('[EMAIL] Email sent successfully via Resend!');
        console.log('[EMAIL] Message ID:', data.data?.id);

        return data.data;
    } catch (error) {
        console.error('[EMAIL] Failed to send email:', error);
        throw error;
    }
};
