import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// A simple route to check if a user is logged in
export async function GET() {
  try {
    const token = cookies().get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ isLoggedIn: false, message: 'No auth token found' });
    }
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
      
      // Return user info without sensitive data
      return NextResponse.json({ 
        isLoggedIn: true, 
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          membershipType: decoded.membershipType
        } 
      });
    } catch (error) {
      // Token verification failed
      return NextResponse.json({ 
        isLoggedIn: false, 
        message: 'Invalid token', 
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
