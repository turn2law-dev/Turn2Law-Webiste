import express, { Request, Response, NextFunction } from 'express';
import serviceTrackingRoutes from './routes/service-tracking.routes';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS configuration - allow production domains
const allowedOrigins = [
  'https://turn2law.tech',
  'https://www.turn2law.tech',
  'https://turn2law-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:9002',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', serviceTrackingRoutes);

// Root endpoint - API information
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Turn2Law Backend API',
    version: '2.0.0',
    status: 'Running',
    auth: 'Supabase Auth (frontend)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      note: 'Authentication is handled by Supabase Auth on the frontend',
      lawyers: {
        list: 'GET /api/lawyers',
        profile: 'GET /api/lawyers/:id'
      },
      consultations: {
        book: 'POST /api/consultations',
        list: 'GET /api/consultations'
      },
      payments: {
        create: 'POST /api/payments/create-payment'
      },
      queries: {
        submit: 'POST /api/submit-query',
        userQueries: 'GET /api/user-queries/:userId',
        allQueries: 'GET /api/all-queries'
      },
      serviceInquiry: {
        submit: 'POST /api/service-inquiry',
        note: 'No authentication required - emails directly to turn2law@gmail.com'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      supabase:   !!process.env.SUPABASE_URL,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gmail:      !!process.env.GMAIL_USER,
      resend:     !!process.env.RESEND_API_KEY,
    }
  });
});

// API Routes - Using Supabase Auth only
// Auth is now handled by Supabase Auth on the frontend
// No custom auth endpoints needed

import lawyersRoutes from './api/lawyers';
import consultationsRoutes from './api/consultations';
import paymentsRoutes from './api/payments';
import queriesRoutes from './api/queries';
import emailOTPRoutes from './api/email-otp';
import serviceInquiryRoutes from './api/service-inquiry';
import serviceRequestsRoutes from './api/service-requests';
import legalNavigatorRoutes from './api/legal-navigator';

// Removed: app.use('/api/auth', authRoutes); 
// Auth is now handled by Supabase Auth directly from frontend
app.use('/api', lawyersRoutes);
app.use('/api', consultationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api', queriesRoutes);
app.use('/api/email-otp', emailOTPRoutes); // Custom email OTP verification (routes: /send-otp, /verify-otp)
app.use('/api', serviceInquiryRoutes); // Service inquiry forms (no auth required)
app.use('/api/service-requests', serviceRequestsRoutes); // Service tracking (new)
app.use('/api', legalNavigatorRoutes); // Legal Navigator AI guidance (new)

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Turn2Law Backend Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;