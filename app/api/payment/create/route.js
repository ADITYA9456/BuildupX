import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';

// Create a Razorpay order
export async function POST(req) {
  try {
    await dbConnect();
    
    const { plan, name, email, phone } = await req.json();
    
    // Define plan prices in INR (using exchange rate of approx 1 USD = 83 INR)
    const planPrices = {
      'STANDARD': 2499,  // ₹2,499 (~$30)
      'ULTIMATE': 3749,  // ₹3,749 (~$45)
      'PROFESSIONAL': 4999 // ₹4,999 (~$60)
    };
    
    const amount = planPrices[plan];
    
    if (!amount) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid plan selected' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Import the Razorpay SDK
    const Razorpay = require('razorpay');
    
    // Create a Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET
    });
    
    // Create a random receipt ID
    const receiptId = 'rcpt_' + Math.random().toString(36).substring(2, 15);
    
    // Create an order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: receiptId,
    });
    
    // Save the order details in the database
    const payment = new Payment({
      userId: email, // Using email as user ID for now
      name,
      email,
      phone,
      plan,
      amount,
      orderId: order.id,
      status: 'pending'
    });
    
    await payment.save();
    
    return new Response(JSON.stringify({ 
      success: true, 
      order,
      amount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
