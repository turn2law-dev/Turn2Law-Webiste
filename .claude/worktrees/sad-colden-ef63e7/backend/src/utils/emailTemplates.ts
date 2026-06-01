
const LOGO_URL = 'https://turn2law.tech/assets/logo.png'; // Make sure this exists or use text
const DASHBOARD_URL = 'https://turn2law.tech/dashboard/client?tab=Track';
const SUPPORT_PHONE = '+91 99061 02527';
const SUPPORT_EMAIL = 'support@turn2law.tech';

// Brand Colors
const BRAND_BLACK = '#1a1a1a';
const BRAND_YELLOW = '#FACC15';
const BRAND_WHITE = '#ffffff';
const BRAND_GRAY = '#f5f5f5';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Turn2Law Notification</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: ${BRAND_BLACK}; }
    .container { max-width: 600px; margin: 0 auto; background-color: ${BRAND_WHITE}; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3); margin-top: 20px; margin-bottom: 20px; border: 1px solid ${BRAND_YELLOW}; }
    .header { background-color: ${BRAND_BLACK}; padding: 30px 20px; text-align: center; border-bottom: 4px solid ${BRAND_YELLOW}; }
    .header h1 { color: ${BRAND_YELLOW}; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px; }
    .content { padding: 30px; background-color: ${BRAND_WHITE}; }
    .content h2 { color: ${BRAND_BLACK}; border-bottom: 2px solid ${BRAND_YELLOW}; padding-bottom: 10px; }
    .button { display: inline-block; padding: 14px 32px; background-color: ${BRAND_YELLOW}; color: ${BRAND_BLACK} !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .button:hover { background-color: #e6b800; }
    .footer { background-color: ${BRAND_BLACK}; padding: 25px 20px; text-align: center; font-size: 12px; color: #888; border-top: 2px solid ${BRAND_YELLOW}; }
    .footer p { margin: 5px 0; }
    .footer a { color: ${BRAND_YELLOW}; text-decoration: none; }
    .info-box { background-color: ${BRAND_GRAY}; border-left: 4px solid ${BRAND_YELLOW}; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .label { font-weight: bold; color: ${BRAND_BLACK}; }
    .value { color: #333; }
    .highlight { color: ${BRAND_YELLOW}; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Turn2Law</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} <strong style="color: ${BRAND_YELLOW};">Turn2Law</strong>. All rights reserved.</p>
      <p>Questions? Call us at <a href="tel:${SUPPORT_PHONE}">${SUPPORT_PHONE}</a> or email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      <p style="margin-top: 15px; color: #666;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const getServiceReceivedEmail = (userName: string, serviceType: string, serviceNumber: string) => {
  const content = `
    <h2>Request Received Successfully</h2>
    <p>Dear ${userName},</p>
    <p>Thank you for choosing Turn2Law. We have successfully received your request for <strong>${serviceType}</strong>.</p>
    
    <div class="info-box">
      <p><span class="label">Service Request ID:</span> <span class="value">${serviceNumber}</span></p>
      <p><span class="label">Status:</span> <span class="value">Submitted</span></p>
    </div>

    <p>Our legal experts will review your application and get back to you shortly. You can track the real-time status of your request and upload any pending documents via your dashboard.</p>

    <div style="text-align: center;">
      <a href="${DASHBOARD_URL}" class="button">Track Request</a>
    </div>
  `;
  return baseTemplate(content);
};

export const getStatusUpdateEmail = (userName: string, serviceType: string, serviceNumber: string, newStatus: string, notes?: string) => {
  const formattedStatus = newStatus.replace(/_/g, ' ').toUpperCase();
  const content = `
    <h2>Status Update: ${formattedStatus}</h2>
    <p>Dear ${userName},</p>
    <p>The status of your service request for <strong>${serviceType}</strong> (Ref: ${serviceNumber}) has been updated.</p>

    <div class="info-box">
      <p><span class="label">New Status:</span> <span class="value">${formattedStatus}</span></p>
      ${notes ? `<p><span class="label">Note:</span> <span class="value">${notes}</span></p>` : ''}
    </div>

    <p>Please log in to your dashboard to view more details or take any necessary actions.</p>

    <div style="text-align: center;">
      <a href="${DASHBOARD_URL}" class="button">View Dashboard</a>
    </div>
  `;
  return baseTemplate(content);
};

export const getDocumentReceivedEmail = (userName: string, serviceType: string, docName: string) => {
  const content = `
      <h2>Document Received</h2>
      <p>Dear ${userName},</p>
      <p>We have received the document <strong>${docName}</strong> for your <strong>${serviceType}</strong> request.</p>
      <p>Our team will verify it shortly.</p>
  
      <div style="text-align: center;">
        <a href="${DASHBOARD_URL}" class="button">Go to Dashboard</a>
      </div>
    `;
  return baseTemplate(content);
};
