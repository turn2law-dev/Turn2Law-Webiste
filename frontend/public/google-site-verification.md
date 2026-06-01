# Google Site Verification Instructions

## How to verify your domain with Google

### Step 1: Get Verification File
1. Go to Google Cloud Console or Google Search Console
2. Navigate to the verification section
3. Choose "HTML file upload" method
4. Download the verification file (e.g., `google1234567890abcdef.html`)

### Step 2: Upload File
- Place the downloaded HTML file directly in this `public/` folder
- The file should be at: `frontend/public/google1234567890abcdef.html`
- Do NOT rename the file - keep the exact name Google provides

### Step 3: Deploy
```bash
# Deploy to Vercel
cd frontend
vercel --prod
```

### Step 4: Verify
- Go back to Google Cloud Console
- Click "Verify" button
- Google will check: `https://turn2law.tech/google1234567890abcdef.html`

---

## Alternative: Meta Tag Method

If you prefer to use a meta tag instead, add this to your main layout file:

```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

Location: `frontend/src/app/layout.tsx` in the `<head>` section
