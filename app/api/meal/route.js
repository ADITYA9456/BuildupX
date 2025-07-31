import { connectDB } from '@/lib/mongodb';
import { Meal } from '@/models/Meal';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Add a new meal
export async function POST(request) {
  try {
    await connectDB();
    
    // Get user from JWT token
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
      const userId = decoded.id;
      const data = await request.json();
    
    // Validate data
    if (!data.name || !data.foods || data.foods.length === 0) {
      return NextResponse.json({ error: 'Meal name and foods are required' }, { status: 400 });
    }
    
    // Calculate total nutrition
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    data.foods.forEach(food => {
      totalCalories += food.calories || 0;
      totalProtein += food.protein || 0;
      totalCarbs += food.carbs || 0;
      totalFat += food.fat || 0;
    });
    
    // Create new meal
    const newMeal = new Meal({
      userId,
      name: data.name,
      foods: data.foods,
      date: data.date || new Date(),
      mealTime: data.mealTime || 'lunch',
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    });
    
    await newMeal.save();
    
    return NextResponse.json({
      success: true,
      message: 'Meal added successfully',
      meal: newMeal
    });
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Add meal error:', error);
    return NextResponse.json({ error: 'Failed to add meal' }, { status: 500 });
  }
}

// Get all meals for the logged-in user
export async function GET(request) {
  try {
    await connectDB();
    
    // Get user from JWT token
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
      const userId = decoded.id;
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build query
    const query = { userId };
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    // Get meals
    const meals = await Meal.find(query).sort({ date: -1 });
    
    return NextResponse.json({ meals });
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json({ error: 'Failed to get meals' }, { status: 500 });
  }
}
