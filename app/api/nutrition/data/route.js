import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Meal from '../../../../models/Meal';
import { getMonthlyAverages, getWeeklyAverages, summarizeMealsByDay } from './helpers';
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
            averages: { labels: [], calories: [], protein: [], carbs: [], fat: [] },
            chartData: { labels: [], datasets: [] }
          },
          monthly: { 
            days: [],
            averages: { labels: [], calories: [], protein: [], carbs: [], fat: [] },
            chartData: { labels: [], datasets: [] }
          }
        };
        
        return NextResponse.json({
          success: true,
          data: emptyData,
          message: 'Returned empty data due to database error'
        });
      }';
import Meal from '../../../../models/Meal';
import { getMonthlyAverages, getWeeklyAverages, summarizeMealsByDay } from './helpers';

// API endpoint to get nutrition data
export async function GET() {
  try {
    console.log('🍎 Nutrition API called');
    
    await connectDB();
    console.log('✅ Database connected');
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      console.log('❌ No auth token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    console.log('🔑 Auth token found');
    
    // Verify the token
    try {
      console.log('🔍 Verifying JWT token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
      const userId = decoded.id;
      console.log('✅ JWT verified, userId:', userId);
      
      // Get today's date at 00:00:00 for filtering
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get week start (7 days ago)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      
      // Get month start (30 days ago)
      const monthStart = new Date();
      monthStart.setDate(monthStart.getDate() - 30);
      monthStart.setHours(0, 0, 0, 0);
      
      try {
        // Get today's meals
        const todaysMeals = await Meal.find({
          userId: userId,
          date: { $gte: today }
        }).sort({ date: 1 });
        
        // Get this week's meals
        const weeklyMeals = await Meal.find({
          userId: userId,
          date: { $gte: weekStart }
        }).sort({ date: 1 });
        
        // Get this month's meals
        const monthlyMeals = await Meal.find({
          userId: userId,
          date: { $gte: monthStart }
        }).sort({ date: 1 });
        
        console.log(`Found meals - Today: ${todaysMeals.length}, Week: ${weeklyMeals.length}, Month: ${monthlyMeals.length}`);
        
        // Format data response
        const dailySummary = summarizeMealsByDay([...todaysMeals]);
        const weeklySummary = summarizeMealsByDay([...weeklyMeals]);
        const monthlySummary = summarizeMealsByDay([...monthlyMeals]);
        
        // Get weekly averages for charts
        const weeklyAverages = getWeeklyAverages(weeklySummary);
        
        // Get monthly averages for charts
        const monthlyAverages = getMonthlyAverages(monthlySummary);
        
        const data = {
          daily: {
            meals: todaysMeals,
            summary: dailySummary.length > 0 ? dailySummary[0] : {
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
            days: weeklySummary,
            averages: weeklyAverages,
            chartData: {
              labels: weeklyAverages.labels,
              datasets: [
                {
                  label: 'Calories',
                  data: weeklyAverages.calories
                },
                {
                  label: 'Protein',
                  data: weeklyAverages.protein
                },
                {
                  label: 'Carbs',
                  data: weeklyAverages.carbs
                },
                {
                  label: 'Fat',
                  data: weeklyAverages.fat
                }
              ]
            }
          },
          monthly: {
            days: monthlySummary,
            averages: monthlyAverages,
            chartData: {
              labels: monthlyAverages.labels,
              datasets: [
                {
                  label: 'Calories',
                  data: monthlyAverages.calories
                },
                {
                  label: 'Protein',
                  data: monthlyAverages.protein
                },
                {
                  label: 'Carbs',
                  data: monthlyAverages.carbs
                },
                {
                  label: 'Fat',
                  data: monthlyAverages.fat
                }
              ]
            }
          }
        };
        
        return NextResponse.json({
          success: true,
          data: data
        });
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // If database fails, return empty data
        const emptyData = {
          daily: { meals: [] },
          weekly: { days: [] },
          monthly: { days: [] }
        };
        
        return NextResponse.json({
          success: true,
          data: emptyData
        });
      }
      
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return NextResponse.json({ 
        error: 'Invalid or expired token. Please log in again.',
        code: 'TOKEN_INVALID'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Nutrition data fetch error:', error.message);
    console.error('Full error details:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to fetch nutrition data';
    if (error.message.includes('connect')) {
      errorMessage = 'Database connection failed';
    } else if (error.message.includes('validation')) {
      errorMessage = 'Data validation error';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
