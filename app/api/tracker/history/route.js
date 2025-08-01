import dbConnect from '../../../lib/mongodb';
import FoodLog from '../../../models/FoodLog';

export async function GET(req) {
  try {
    // Connect to the database
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date'); // Optional date parameter (YYYY-MM-DD)
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Build query - always filter by userId
    let query = { userId };
    
    // If date is provided, add date filtering
    if (date) {
      // Create start and end of the day for the given date
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    console.log("Fetching logs with query:", JSON.stringify(query));
    
    // Get food logs for the user using Mongoose model
    const logs = await FoodLog.find(query)
      .sort({ date: -1 })
      .limit(date ? 100 : 50); // Return more results if filtering by date
    
    console.log(`Found ${logs.length} food log entries for user ${userId}`);
    
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
