import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import crypto from 'crypto';

// Verify Razorpay payment
export async function POST(req) {
  try {
    await dbConnect();
    
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();
    
    // Get the payment record from the database
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    
    if (!payment) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No payment record found for this order' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify the signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      // Update payment status to failed
      payment.status = 'failed';
      await payment.save();
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid signature' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update payment status to success
    payment.status = 'success';
    payment.paymentId = razorpay_payment_id;
    await payment.save();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        plan: payment.plan,
        amount: payment.amount,
        name: payment.name,
        email: payment.email,
        status: payment.status
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
