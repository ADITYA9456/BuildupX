import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Meal from '../../../../models/Meal';
import { getMonthlyAverages, getWeeklyAverages, summarizeMealsByDay } from './helpers';

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.id;
    
    // Connect to the database
    await connectDB();
    
    // Get all meals for the user
    const userMeals = await Meal.find({ userId }).sort({ date: -1 });
    
    if (!userMeals || userMeals.length === 0) {
      const emptyData = {
        today: {
          summary: {
            date: new Date().toISOString().split('T')[0],
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            totalFiber: 0,
            meals: []
          }
        },
        weekly: { 
          days: [],
          averages: { labels: [], calories: [], protein: [], carbs: [], fat: [], fiber: [] },
          chartData: { labels: [], datasets: [] }
        },
        monthly: { 
          days: [],
          averages: { labels: [], calories: [], protein: [], carbs: [], fat: [], fiber: [] },
          chartData: { labels: [], datasets: [] }
        }
      };
      
      return NextResponse.json({
        success: true,
        data: emptyData,
        message: 'No meal data found'
      });
    }
    
    // Process and organize the data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = today.toISOString().split('T')[0];
    
    // Get today's meals
    const todayMeals = userMeals.filter(meal => {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === today.getTime();
    });
    
    // Calculate daily summary
    const dailySummary = summarizeMealsByDay(todayMeals, todayStr);
    
    // Get weekly and monthly data
    const weeklyData = getWeeklyAverages(userMeals);
    const monthlyData = getMonthlyAverages(userMeals);
    
    // Compile the complete nutrition data
    const nutritionData = {
      today: {
        summary: dailySummary
      },
      weekly: weeklyData,
      monthly: monthlyData
    };
    
    return NextResponse.json({
      success: true,
      data: nutritionData
    });
    
  } catch (error) {
    console.error('Nutrition API error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch nutrition data',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
