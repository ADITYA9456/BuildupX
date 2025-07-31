import dbConnect from '../../../lib/mongodb';
import FoodLog from '../../../models/FoodLog';

export async function GET(req) {
  try {
    // Connect to the database
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get food logs for the user using Mongoose model
    const logs = await FoodLog.find({ userId })
      .sort({ date: -1 })
      .limit(50);
    
    return new Response(JSON.stringify({ 
      success: true, 
      logs 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to fetch food logs:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
