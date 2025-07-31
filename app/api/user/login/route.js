import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    await dbConnect();
    
    const { email, password } = await req.json();
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user || !user.verifyPassword(password)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid email or password' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if membership is active
    if (!user.membership.active) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Your membership has expired' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create JWT token
    const token = await new SignJWT({ 
      id: user._id.toString(),
      email: user.email,
      plan: user.membership.plan
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'buildup-x-default-secret'));
    
    // Set cookie
    cookies().set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.membership.plan
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
