import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, mobile, message } = body;

    // Validate input
    if (!firstName || !lastName || !email || !mobile || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create email content
    const emailContent = `
New Contact Form Submission from Turn2Law Website

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${mobile}

Message:
${message}

---
This message was sent from the Turn2Law contact form.
    `.trim();

    // TODO: Replace with actual email service (SendGrid, Resend, Nodemailer, etc.)
    // For now, we'll log it and return success
    // You'll need to install an email service package and configure it
    
    console.log('=== NEW CONTACT FORM SUBMISSION ===');
    console.log(emailContent);
    console.log('===================================');

    // Example using fetch to send email (you'll need to implement this with your email service)
    // For production, use services like:
    // - Resend (https://resend.com) - Recommended, easy setup
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    
    /*
    // Example with Resend:
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Turn2Law <onboarding@resend.dev>',
      to: 'turntwolaw@gmail.com',
      subject: `New Contact Form: ${firstName} ${lastName}`,
      text: emailContent,
    });
    */

    // For now, simulate successful email send
    // In production, replace this with actual email sending code
    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully',
        // Remove this in production - only for development
        dev_note: 'Email logged to console. Implement actual email service for production.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending contact email:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
