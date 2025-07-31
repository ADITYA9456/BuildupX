import dbConnect from '../../../lib/mongodb';
import FoodLog from '../../../models/FoodLog';

export async function POST(req) {
  try {
    // Connect to the database
    await dbConnect();
    
    const logData = await req.json();
    
    // Create a new food log entry using the Mongoose model
    const foodLog = new FoodLog({
      userId: logData.userId,
      meal: logData.meal,
      food: logData.food,
      quantity: logData.quantity || 1,
      calories: logData.calories,
      protein: logData.protein || 0,
      carbs: logData.carbs || 0,
      fat: logData.fat || 0
    });
    
    // Save the food log
    const savedLog = await foodLog.save();
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: savedLog._id 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to save food log:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
