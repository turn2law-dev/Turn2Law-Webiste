# Email Service Setup Guide for Turn2Law Contact Form

## Current Status
The contact form is functional but emails are only logged to the console. To receive emails at **turntwolaw@gmail.com**, you need to set up an email service.

---

## Recommended Solution: Resend

**Resend** is the easiest and most reliable option for Next.js applications.

### Why Resend?
- ✅ Simple setup (5 minutes)
- ✅ Free tier: 100 emails/day, 3,000 emails/month
- ✅ Built for developers
- ✅ No complex configuration
- ✅ Excellent deliverability

---

## Setup Instructions

### Step 1: Install Resend Package
```bash
cd frontend
npm install resend
```

### Step 2: Sign Up for Resend
1. Go to https://resend.com
2. Sign up with your email
3. Verify your email address

### Step 3: Get Your API Key
1. After logging in, go to **API Keys** in the dashboard
2. Click **Create API Key**
3. Give it a name like "Turn2Law Production"
4. Copy the API key (you'll only see it once!)

### Step 4: Add API Key to Environment Variables

Create or update `.env.local` in the `frontend` directory:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_YourActualAPIKeyHere
```

**Important:** Never commit this file to git! It should already be in `.gitignore`.

### Step 5: Verify Domain (Optional but Recommended)

For production, you should verify your domain to send emails from your own domain (e.g., noreply@turn2law.com instead of onboarding@resend.dev).

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., turn2law.com)
4. Add the DNS records they provide to your domain's DNS settings
5. Wait for verification (usually a few minutes)

**For now, you can use Resend's test domain to get started immediately.**

---

## Code Implementation (Already Done!)

The code has been updated in `/frontend/src/app/actions.ts` to use Resend. 

Here's what happens when someone submits the contact form:

1. Form data is validated
2. Email is sent to **turntwolaw@gmail.com** using Resend
3. The sender's email is set as reply-to, so you can reply directly
4. User sees success message

---

## Alternative Options

### Option 2: Gmail SMTP (Free but Complex)
**Pros:** Free, uses your existing Gmail
**Cons:** Requires app password, less reliable, complex setup

<details>
<summary>Click to see Gmail setup instructions</summary>

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: https://myaccount.google.com/apppasswords
3. Install nodemailer: `npm install nodemailer`
4. Add to `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=turntwolaw@gmail.com
   SMTP_PASS=your-app-password-here
   ```
5. Update the server action to use Nodemailer instead of Resend

**Note:** Gmail limits sending to 500 emails/day for free accounts.
</details>

### Option 3: SendGrid (Enterprise Solution)
**Pros:** Very reliable, good for high volume
**Cons:** More expensive, overkill for a contact form

**Free tier:** 100 emails/day forever

### Option 4: AWS SES (Advanced)
**Pros:** Very cheap ($0.10 per 1,000 emails)
**Cons:** Complex setup, requires AWS account

---

## Testing

### Test in Development
```bash
cd frontend
npm run dev
```

1. Navigate to `http://localhost:3000`
2. Scroll to the contact form
3. Fill out the form and submit
4. Check the terminal/console - you should see the email being sent
5. Check **turntwolaw@gmail.com** inbox

### Test Email Sending
Once you've set up Resend, the emails will be sent automatically. You'll see:
- Success message in the browser
- Log in terminal showing email was sent
- Email received at turntwolaw@gmail.com

---

## Troubleshooting

### Issue: "RESEND_API_KEY is not defined"
**Solution:** Make sure `.env.local` is in the `frontend` directory and the key is correct.

### Issue: "Domain not verified"
**Solution:** You can still send emails from `onboarding@resend.dev` for testing. For production, verify your domain.

### Issue: Emails going to spam
**Solution:** 
1. Verify your domain in Resend
2. Add SPF and DKIM records
3. Start with low volume to build reputation

### Issue: API key not working
**Solution:** 
1. Make sure you copied the full key
2. Restart your dev server after adding the key
3. Generate a new API key if needed

---

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add the `RESEND_API_KEY` environment variable in your hosting platform
2. Verify your domain in Resend
3. Update the "from" email to use your domain
4. Test thoroughly before launch

### Environment Variables for Production
```
RESEND_API_KEY=re_YourProductionAPIKey
```

---

## Cost Estimation

### Free Tier (Sufficient for Most Cases)
- **Resend Free:** 3,000 emails/month
- **Average contact forms:** 10-50/month
- **Estimated cost:** $0/month ✅

### If You Exceed Free Tier
- **Resend Pro:** $20/month for 50,000 emails
- Very unlikely to need this for a contact form

---

## Quick Start (5 Minutes)

1. **Install Resend:**
   ```bash
   cd frontend
   npm install resend
   ```

2. **Sign up at https://resend.com** (free)

3. **Get API key** from dashboard

4. **Create `.env.local` in frontend directory:**
   ```bash
   RESEND_API_KEY=re_your_key_here
   ```

5. **Restart dev server:**
   ```bash
   npm run dev
   ```

6. **Test the form** - emails will now be sent to turntwolaw@gmail.com! 🎉

---

## Support

If you encounter any issues:
1. Check Resend documentation: https://resend.com/docs
2. Check the logs in your terminal
3. Verify your API key is correct
4. Make sure `.env.local` is in the right directory

---

**Status:** ⚠️ Email service needs to be configured (follow Quick Start above)  
**Estimated Setup Time:** 5 minutes  
**Cost:** Free (up to 3,000 emails/month)
