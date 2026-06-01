// Test script to verify Resend email functionality
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function testEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in .env.local');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  
  const resend = new Resend(apiKey);
  
  try {
    console.log('\n📧 Attempting to send test email...\n');
    
    const result = await resend.emails.send({
      from: 'Turn2Law Contact Form <onboarding@resend.dev>',
      to: 'turntwolaw@gmail.com',
      subject: 'Test Email from Turn2Law Contact Form',
      text: `This is a test email to verify Resend integration is working.

Name: Test User
Email: test@example.com
Phone: 1234567890

Message:
This is a test message to ensure emails are being delivered correctly.

---
Sent at ${new Date().toLocaleString()}`,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Response:', JSON.stringify(result, null, 2));
    console.log('\n✉️  Check turntwolaw@gmail.com for the test email!');
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

testEmail();
