import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import crypto from 'crypto';

const router = Router();

// In-memory OTP storage (use Redis in production for scalability)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

import { sendEmail } from '../utils/email';

// Generate 6-digit OTP
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Send OTP to email for verification
 * POST /api/auth/send-otp
 * Body: { email: string }
 */
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists in Supabase Auth
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      console.error('[OTP] Error fetching users:', userError);
      return res.status(500).json({ error: 'Failed to check user' });
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    // Check if user signed up with Google OAuth
    const isGoogleUser = user.app_metadata.provider === 'google' ||
      user.identities?.some((id: any) => id.provider === 'google');

    if (isGoogleUser) {
      return res.status(400).json({
        error: 'This account uses Google Sign-in and does not require email verification'
      });
    }

    // Allow resending OTP even if email was already confirmed (for re-verification scenarios)
    // This also handles cases where Supabase auto-confirmed the email

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { otp, expiresAt, attempts: 0 });

    // Create beautiful HTML email
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo-text {
            font-size: 32px;
            font-weight: bold;
            color: #DF9C49;
            letter-spacing: -1px;
          }
          .otp-box {
            background: linear-gradient(135deg, #DF9C49 0%, #AE7739 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 10px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
          }
          .info-box {
            background: #f9f9f9;
            border-left: 4px solid #DF9C49;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #DF9C49;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <div class="logo-text">Turn2Law</div>
          </div>
          
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">
            Verify Your Email Address
          </h1>
          
          <p style="font-size: 16px; color: #555; text-align: center;">
            Thank you for signing up with Turn2Law! Please use the verification code below 
            to complete your registration and access all features.
          </p>
          
          <div class="otp-box">
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Valid for 10 minutes</p>
          </div>
          
          <div class="info-box">
            <strong>⚠️ Important Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This code will expire in <strong>10 minutes</strong></li>
              <li><strong>Never share</strong> this code with anyone</li>
              <li>Turn2Law staff will never ask for your verification code</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #555; margin-top: 30px; text-align: center;">
            Having trouble? Contact our support team at 
            <a href="mailto:support@turn2law.com" style="color: #DF9C49; text-decoration: none; font-weight: bold;">
              support@turn2law.com
            </a>
          </p>
          
          <div class="footer">
            <p>
              This is an automated message from Turn2Law.<br>
              Please do not reply to this email.
            </p>
            <p style="margin-top: 10px;">
              © ${new Date().getFullYear()} Turn2Law. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email
    await sendEmail(email, 'Verify Your Email - Turn2Law', emailHTML);

    console.log(`[OTP] Sent OTP ${otp} to: ${email}`);

    return res.json({
      success: true,
      message: 'OTP sent successfully. Please check your email.',
      expiresIn: 600 // seconds (10 minutes)
    });

  } catch (error: any) {
    console.error('[OTP] Error sending OTP:', error);
    return res.status(500).json({
      error: 'Failed to send OTP. Please try again.'
    });
  }
});

/**
 * Verify OTP and confirm email
 * POST /api/auth/verify-otp
 * Body: { email: string, otp: string }
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get stored OTP data
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        error: 'No OTP found for this email. Please request a new one.'
      });
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Check number of attempts (max 5)
    if (storedData.attempts >= 5) {
      otpStore.delete(email);
      return res.status(429).json({
        error: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedData.otp !== otp.trim()) {
      storedData.attempts += 1;
      otpStore.set(email, storedData);

      return res.status(400).json({
        error: 'Invalid OTP. Please check and try again.',
        attemptsRemaining: 5 - storedData.attempts
      });
    }

    // OTP is valid - clear from store
    otpStore.delete(email);

    // Update user's email_confirmed_at in Supabase
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      console.error('[OTP] Error fetching users:', userError);
      return res.status(500).json({ error: 'Failed to verify email' });
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Confirm email in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('[OTP] Error confirming email:', updateError);
      return res.status(500).json({ error: 'Failed to confirm email' });
    }

    console.log(`[OTP] Email verified successfully for: ${email}`);

    return res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });

  } catch (error: any) {
    console.error('[OTP] Error verifying OTP:', error);
    return res.status(500).json({
      error: 'Failed to verify OTP. Please try again.'
    });
  }
});

/**
 * Resend OTP to email
 * POST /api/auth/resend-otp
 * Body: { email: string }
 */
router.post('/resend-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if there's an existing OTP that hasn't expired yet
    const existingData = otpStore.get(email);
    if (existingData && Date.now() < existingData.expiresAt) {
      const timeRemaining = Math.ceil((existingData.expiresAt - Date.now()) / 1000);
      if (timeRemaining > 540) { // More than 9 minutes remaining (prevent spam)
        return res.status(429).json({
          error: 'Please wait before requesting a new OTP',
          secondsRemaining: timeRemaining - 540
        });
      }
    }

    // Delete old OTP
    otpStore.delete(email);

    // Check if user exists and is not verified
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      console.error('[OTP] Error fetching users:', userError);
      return res.status(500).json({ error: 'Failed to check user' });
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Allow resending even if already verified (Supabase may auto-verify)
    // Our OTP system will handle verification properly

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt, attempts: 0 });

    // Create email HTML (reuse from send-otp)
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .logo-text {
            font-size: 32px;
            font-weight: bold;
            color: #DF9C49;
            text-align: center;
            margin-bottom: 30px;
          }
          .otp-box {
            background: linear-gradient(135deg, #DF9C49 0%, #AE7739 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 10px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-text">Turn2Law</div>
          <h1 style="text-align: center; color: #333;">New Verification Code</h1>
          <p style="text-align: center; color: #555;">You requested a new verification code. Here it is:</p>
          <div class="otp-box">
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your New Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Valid for 10 minutes</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(email, 'New Verification Code - Turn2Law', emailHTML);

    console.log(`[OTP] Resent OTP ${otp} to: ${email}`);

    return res.json({
      success: true,
      message: 'New OTP sent successfully',
      expiresIn: 600
    });

  } catch (error: any) {
    console.error('[OTP] Error resending OTP:', error);
    return res.status(500).json({
      error: 'Failed to resend OTP'
    });
  }
});

export default router;
