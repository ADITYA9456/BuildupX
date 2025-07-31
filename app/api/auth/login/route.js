import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import User from '../../../../models/User';

// Use a simpler auth system with JWT tokens directly
export async function POST(request) {
  try {
    console.log('=== Login API Called ===');
    
    // Test database connection first
    try {
      await connectDB();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed. Please check your MongoDB Atlas connection.' 
      }, { status: 500 });
    }
    
    // Get request body and validate it's JSON
    const body = await request.text();
    let email, password;
    
    try {
      const data = JSON.parse(body);
      email = data.email;
      password = data.password;
      console.log('📧 Login attempt for email:', email);
    } catch (err) {
      console.error('JSON parse error:', err);
      return NextResponse.json({ error: 'Invalid JSON format in request' }, { status: 400 });
    }
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Check password using the User model's built-in verification method
    let isPasswordValid = false;
    
    // If the user has a salt field, use the crypto verification method from the User model
    if (user.salt) {
      try {
        // Using the User model's own verification method
        isPasswordValid = user.verifyPassword(password);
        console.log('Using crypto verification method, result:', isPasswordValid);
      } catch (err) {
        console.error('Custom password verification error:', err);
      }
    } else {
      // Fallback to bcrypt in case some passwords were stored with bcrypt
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Using bcrypt verification method, result:', isPasswordValid);
      } catch (err) {
        console.error('Bcrypt password comparison error:', err);
      }
      
      // Last resort - direct comparison for plaintext passwords (development only)
      if (!isPasswordValid && process.env.NODE_ENV !== 'production') {
        console.log('All password checks failed, trying direct comparison');
        isPasswordValid = (password === user.password);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Password validation failed for user:', email);
      // For debugging, log password info (REMOVE IN PRODUCTION)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Password attempted:', password);
        console.log('User has salt:', !!user.salt);
      }
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membershipType
      },
      process.env.JWT_SECRET || 'fallback-jwt-secret',
      { expiresIn: '7d' }
    );
    
    // Set cookie
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict'
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membershipType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Provide more detailed error information in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ 
        error: 'Login failed',
        details: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
