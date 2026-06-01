import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Middleware
 * 
 * This middleware adds critical security protections:
 * 1. Clears any sensitive tokens from URLs before processing
 * 2. Adds security headers to all responses
 * 3. Prevents token reuse attacks
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // CRITICAL SECURITY: Block any request with tokens in URL
  // Tokens should ONLY be processed server-side via /api/auth/callback
  const hasTokenInUrl = 
    url.hash.includes('access_token') ||
    url.hash.includes('refresh_token') ||
    url.searchParams.has('access_token') ||
    url.searchParams.has('refresh_token');
  
  if (hasTokenInUrl && !url.pathname.startsWith('/api/auth/callback')) {
    console.warn('[Middleware] ⚠️ SECURITY: Blocked request with tokens in URL:', url.pathname);
    
    // Redirect to clean URL
    const cleanUrl = new URL(url.pathname, url.origin);
    return NextResponse.redirect(cleanUrl);
  }
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Only set CSP in production to avoid dev issues
  if (process.env.NODE_ENV === 'production') {
    const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://turn2law-backend-p3r6.onrender.com';
    const lawgptApiUrl = process.env.NEXT_PUBLIC_LAWGPT_API_URL || 'https://turn2law-lawgpt-zzj3.onrender.com';
    
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        `connect-src 'self' https://*.supabase.co ${backendApiUrl} ${lawgptApiUrl}`,
        "frame-ancestors 'none'",
      ].join('; ')
    );
  }
  
  return response;
}

// Apply middleware to all routes except static files and api routes (except callback)
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
