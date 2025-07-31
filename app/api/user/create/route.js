import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import User from '@/models/User';

export async function POST(req) {
  try {
    console.log('=== User Create API Called ===');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    const { email, password, plan, profile } = await req.json();
    console.log('Creating user with email:', email, 'plan:', plan);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User with this email already exists' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find payment record to verify
    const payment = await Payment.findOne({ 
      email, 
      plan,
      status: 'success'
    });
    
    if (!payment) {
      console.log('❌ No valid payment record found for:', email, plan);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No valid payment record found' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ Payment record found:', payment.name, payment.phone);
    
    // Create new user
    const user = new User({
      email,
      name: payment.name,
      phone: payment.phone,
      membership: {
        plan,
        startDate: new Date(),
        active: true
      },
      profile
    });
    
    // Set password securely
    user.setPassword(password);
    console.log('✅ Password set for user');
    
    // Save user
    await user.save();
    console.log('✅ User saved successfully:', user.email);
    
    // Update payment with user ID
    payment.userId = user._id;
    await payment.save();
    console.log('✅ Payment record updated with user ID');
    
    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.membership.plan
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
