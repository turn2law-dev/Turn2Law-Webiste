# Service Inquiry Form Backend Setup

## Overview
All service pages now submit inquiries directly to `turn2law@gmail.com` without requiring user authentication.

## Backend Endpoint

### API Endpoint
```
POST /api/service-inquiry
```

### Request Body
```typescript
{
  serviceName: string;        // Required: Name of the service
  name: string;               // Required: Customer's full name
  email: string;              // Required: Customer's email
  phone: string;              // Required: Customer's phone number
  businessName?: string;      // Optional: Business name
  businessType?: string;      // Optional: Business type
  pan?: string;               // Optional: PAN number
  gstin?: string;             // Optional: GSTIN
  returnType?: string;        // Optional: GST return type
  selectedPlan?: string;      // Optional: Selected pricing plan
  message?: string;           // Optional: Additional message
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Your inquiry has been submitted successfully! We will contact you within 24 hours.",
  "inquiryDetails": {
    "serviceName": "Partnership Firm Registration",
    "customerName": "John Doe",
    "submittedAt": "2025-12-05T10:30:00.000Z"
  }
}
```

### Response (Error)
```json
{
  "error": "Missing required fields",
  "required": ["serviceName", "name", "email", "phone"]
}
```

## Email Format

When a form is submitted, Turn2Law receives a beautifully formatted email at `turn2law@gmail.com` containing:

- **Service Name**: The service the customer is interested in
- **Customer Details**: Name, email, phone
- **Business Information**: Business name, type, PAN, GSTIN (if applicable)
- **Selected Plan**: The pricing plan chosen by the customer
- **Additional Message**: Any custom message from the customer
- **Timestamp**: When the inquiry was submitted (IST timezone)

The email has `reply-to` set to the customer's email for easy response.

## Features

✅ **No Authentication Required**: Customers can submit inquiries without signing up
✅ **Direct Email Delivery**: All inquiries go straight to `turn2law@gmail.com`
✅ **Professional Email Format**: HTML formatted emails with all inquiry details
✅ **Validation**: Email and phone format validation
✅ **Error Handling**: Comprehensive error handling with user-friendly messages
✅ **Reply-To Support**: Easy to respond directly from email client

## Services Integrated

1. Partnership Firm Registration
2. Private Limited Company Registration
3. One Person Company (OPC) Registration
4. Limited Liability Partnership (LLP) Registration
5. GST Registration
6. GST Return Filing
7. Import Export Code (IEC) Registration

## Environment Variables Required

```env
RESEND_API_KEY=your_resend_api_key_here
```

The backend uses Resend API for reliable email delivery (no SMTP port issues on Render).

## Testing the Endpoint

```bash
curl -X POST http://localhost:3001/api/service-inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Partnership Firm Registration",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "businessName": "ABC Enterprises",
    "selectedPlan": "Standard - ₹9,999 (Recommended)",
    "message": "I want to register my partnership firm"
  }'
```

## Next Steps

1. Update all frontend service page forms to submit to `/api/service-inquiry`
2. Add loading states and success/error messages in frontend
3. Test form submissions from all service pages
4. Verify emails are received at `turn2law@gmail.com`
