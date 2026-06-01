import { Router, Request, Response } from 'express';
import { createServiceTracking } from '../store/service-tracking.store';
import { sendEmail } from '../utils/email';

const router = Router();

interface ServiceInquiry {
  serviceName: string;
  name: string;
  email: string;
  phone: string;
  businessName?: string;
  businessType?: string;
  pan?: string;
  gstin?: string;
  returnType?: string;
  selectedPlan?: string;
  message?: string;
}

/**
 * Send service inquiry email via Resend
 */
const sendServiceInquiryEmail = async (inquiry: ServiceInquiry) => {
  console.log('='.repeat(80));
  console.log('[SERVICE INQUIRY] Sending inquiry to Turn2Law');
  console.log('[SERVICE INQUIRY] Service:', inquiry.serviceName);
  console.log('[SERVICE INQUIRY] Customer:', inquiry.name, inquiry.email);
  console.log('='.repeat(80));

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>New Service Inquiry</h2>
      <p><b>Service:</b> ${inquiry.serviceName}</p>
      <p><b>Name:</b> ${inquiry.name}</p>
      <p><b>Email:</b> ${inquiry.email}</p>
      <p><b>Phone:</b> ${inquiry.phone}</p>
      ${inquiry.businessName ? `<p><b>Business:</b> ${inquiry.businessName}</p>` : ''}
      ${inquiry.selectedPlan ? `<p><b>Plan:</b> ${inquiry.selectedPlan}</p>` : ''}
      ${inquiry.message ? `<p><b>Message:</b> ${inquiry.message}</p>` : ''}
      <p>Submitted on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
    </body>
    </html>
  `;

  await sendEmail(
    'turntwolaw@gmail.com',
    `New ${inquiry.serviceName} Inquiry from ${inquiry.name}`,
    htmlContent
  );

  console.log('[SERVICE INQUIRY] Email sent successfully');
};

/**
 * POST /api/service-inquiry
 */
router.post('/service-inquiry', async (req: Request, res: Response) => {
  try {
    const inquiryData: ServiceInquiry = req.body;

    // Validation
    if (!inquiryData.serviceName || !inquiryData.name || !inquiryData.email || !inquiryData.phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiryData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(inquiryData.phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // CREATE TRACKING ENTRY
    const serviceId = `SRV-${Date.now()}`;

    createServiceTracking({
      serviceId,
      userEmail: inquiryData.email,
      serviceName: inquiryData.serviceName,
      status: 'submitted',
      timeline: [
        {
          step: 'Request Submitted',
          timestamp: new Date().toISOString(),
        },
      ],
      estimatedCompletion: '13 Jan',
      createdAt: new Date().toISOString(),
    });

    // EMAIL: production only
    if (process.env.NODE_ENV === 'production') {
      await sendServiceInquiryEmail(inquiryData);
    } else {
      console.log('[DEV MODE] Email skipped (set NODE_ENV=production to send)');
    }

    return res.status(200).json({
      success: true,
      serviceId,
      message: 'Inquiry submitted successfully',
    });
  } catch (error) {
    console.error('[SERVICE INQUIRY] Error:', error);
    return res.status(500).json({
      error: 'Failed to submit inquiry',
      message: 'Please try again later',
    });
  }
});

export default router;
