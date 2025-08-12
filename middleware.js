import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// This middleware checks for authentication and redirects if needed
export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                       path === '/login' || 
                       path === '/setup-account' || 
                       path === '/about' ||
                       path === '/classes' ||
                       path === '/contact' ||
                       path === '/tracker' ||
                       path.startsWith('/api/') ||
                       path.startsWith('/_next/') ||
                       path.startsWith('/favicon');
                       
  // Define protected paths that require authentication
  const isProtectedPath = path === '/dashboard' ||
                          path === '/profile' ||
                          path === '/workout';
                          
  // Get the token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  
  // If path requires auth and no token exists, redirect to login
  if (isProtectedPath && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If token exists but user tries to access login page, redirect to dashboard
  if (path === '/login' && authToken) {
    try {
      // Verify token is valid
      jwt.verify(authToken, process.env.JWT_SECRET || 'fallback-jwt-secret');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // If token is invalid, clear it and continue to login
      cookies().delete('auth-token');
    }
  }
  
  return NextResponse.next();
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except api routes that handle their own auth
    '/((?!api/auth|api/system|_next/static|_next/image|favicon.ico).*)',
  ],
};
