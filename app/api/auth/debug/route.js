import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';

// This is a debug endpoint to test user creation and login
export async function POST(request) {
  // Only available in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    await connectDB();
    
    // Get request body and validate it's JSON
    const body = await request.text();
    let email, password, action;
    
    try {
      const data = JSON.parse(body);
      email = data.email;
      password = data.password;
      action = data.action;
    } catch (err) {
      console.error('JSON parse error:', err);
      return NextResponse.json({ error: 'Invalid JSON format in request' }, { status: 400 });
    }
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // If action is check, just check if user exists
    if (action === 'check') {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ exists: false });
      }
      return NextResponse.json({ 
        exists: true, 
        hasSalt: !!user.salt,
        hashedPasswordLength: user.password?.length || 0
      });
    }
    
    // For test_login action, attempt to verify with both methods
    if (action === 'test_login' && password) {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ exists: false });
      }
      
      // Try both verification methods
      let cryptoValid = false;
      let bcryptValid = false;
      let plainValid = false;
      
      // 1. Try crypto method if user has salt
      if (user.salt) {
        cryptoValid = user.verifyPassword(password);
      }
      
      // 2. Try bcrypt
      try {
        const bcrypt = require('bcryptjs');
        bcryptValid = await bcrypt.compare(password, user.password);
      } catch (err) {}
      
      // 3. Try plain comparison
      plainValid = (password === user.password);
      
      return NextResponse.json({
        cryptoValid,
        bcryptValid,
        plainValid,
        hashedPassword: user.password?.substring(0, 10) + '...',
        hasSalt: !!user.salt
      });
    }
    
    // If action is reset, reset the user's password using the User model's method
    if (action === 'reset' && password) {
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create a test user if one doesn't exist
        user = new User({ 
          email,
          name: 'Test User',
          role: 'user',
          membershipType: 'basic'
        });
      }
      
      // Use the model's setPassword method to properly hash the password
      user.setPassword(password);
      await user.save();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Password has been set using crypto method',
        user: {
          email: user.email,
          hasSalt: !!user.salt
        }
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
