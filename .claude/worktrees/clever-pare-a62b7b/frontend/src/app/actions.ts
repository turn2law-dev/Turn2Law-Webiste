'use server';

import { matchLawyer, MatchLawyerInput, MatchLawyerOutput } from "@/ai/flows/match-lawyer";
import { z } from 'zod';

// Lawyer matching schema
const schema = z.object({
  legalNeedDescription: z.string().min(10, { message: "Please provide a more detailed description (at least 10 characters)." }),
});

export type FormState = {
  message: string;
  lawyers?: MatchLawyerOutput;
  error?: string;
}

export async function findLawyerAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    legalNeedDescription: formData.get('legalNeedDescription'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      error: validatedFields.error.flatten().fieldErrors.legalNeedDescription?.[0],
    };
  }

  const input: MatchLawyerInput = {
    legalNeedDescription: validatedFields.data.legalNeedDescription,
  };

  try {
    const lawyers = await matchLawyer(input);
    if (!lawyers || lawyers.length === 0) {
      return { message: "We couldn't find a suitable match. Please try rephrasing your need." };
    }
    return { message: "We found potential matches for you!", lawyers };
  } catch (e) {
    console.error(e);
    return { message: "An unexpected error occurred. Please try again later.", error: "Server error" };
  }
}

// Contact form schema
const contactSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  mobile: z.string().min(10, { message: "Valid phone number is required" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

export type ContactFormState = {
  message: string;
  success?: boolean;
  error?: string;
}

export async function sendContactFormAction(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const validatedFields = contactSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    mobile: formData.get('mobile'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return {
      message: "Validation failed.",
      error: firstError || "Please check your input.",
    };
  }

  const { firstName, lastName, email, mobile, message } = validatedFields.data;

  try {
    // Create email content
    const emailContent = `
New Contact Form Submission from Turn2Law Website

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${mobile}

Message:
${message}

---
This message was sent from the Turn2Law contact form at ${new Date().toLocaleString()}.
    `.trim();

    // Always log the contact form submission
    console.log('\n=== NEW CONTACT FORM SUBMISSION ===');
    console.log(emailContent);
    console.log('===================================\n');

    // Insert into Supabase
    const { supabase } = await import('@/lib/supabase');
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: mobile,
        message,
        status: 'new'
      });

    if (dbError) {
      console.error('Failed to save contact message to database:', dbError);
      // We continue to try sending email even if DB save fails, or you could return error here
    }

    // Try to send email using Resend if API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        // Dynamically import Resend to avoid errors if not installed
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'Turn2Law Contact Form <onboarding@resend.dev>', // Use your verified domain in production
          to: 'turntwolaw@gmail.com',
          subject: `New Contact Form: ${firstName} ${lastName}`,
          text: emailContent,
          replyTo: email, // Allows you to reply directly to the sender
        });

        console.log('✅ Email sent successfully to turntwolaw@gmail.com');
      } catch (emailError) {
        console.error('❌ Failed to send email via Resend:', emailError);
        // Still return success to user since we logged the message
      }
    } else {
      console.warn('⚠️  RESEND_API_KEY not configured. Email logged to console only.');
      console.warn('📧 To receive emails, follow the setup guide in /frontend/docs/EMAIL_SETUP_GUIDE.md');
    }

    return {
      message: "Thank you for contacting us! We'll get back to you shortly.",
      success: true
    };
  } catch (e) {
    console.error('Contact form error:', e);
    return {
      message: "Failed to send message. Please try again later.",
      error: "Server error"
    };
  }
}
