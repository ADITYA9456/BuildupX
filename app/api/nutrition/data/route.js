import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Meal from '../../../../models/Meal';

export async function GET(request) {
  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    // Check if token exists
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Extract user ID from token
    const userId = decoded.id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user data in token' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get current date for filtering
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toISOString().split('T')[0];

    // Get all meals for the user
    const userMeals = await Meal.find({ userId }).sort({ date: -1 });

    // Create empty data structure with zeros
    const emptyData = {
      daily: {
        summary: {
          date: todayStr,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalFiber: 0
        },
        meals: []
      },
      weekly: {
        days: [],
        averages: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          calories: [0, 0, 0, 0, 0, 0, 0],
          protein: [0, 0, 0, 0, 0, 0, 0],
          carbs: [0, 0, 0, 0, 0, 0, 0],
          fat: [0, 0, 0, 0, 0, 0, 0],
          fiber: [0, 0, 0, 0, 0, 0, 0]
        },
        chartData: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            { label: 'Calories', data: [0, 0, 0, 0, 0, 0, 0] },
            { label: 'Protein', data: [0, 0, 0, 0, 0, 0, 0] },
            { label: 'Carbs', data: [0, 0, 0, 0, 0, 0, 0] },
            { label: 'Fat', data: [0, 0, 0, 0, 0, 0, 0] },
            { label: 'Fiber', data: [0, 0, 0, 0, 0, 0, 0] }
          ]
        }
      },
      monthly: {
        days: [],
        averages: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          calories: [0, 0, 0, 0],
          protein: [0, 0, 0, 0],
          carbs: [0, 0, 0, 0],
          fat: [0, 0, 0, 0],
          fiber: [0, 0, 0, 0]
        },
        chartData: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            { label: 'Calories', data: [0, 0, 0, 0] },
            { label: 'Protein', data: [0, 0, 0, 0] },
            { label: 'Carbs', data: [0, 0, 0, 0] },
            { label: 'Fat', data: [0, 0, 0, 0] },
            { label: 'Fiber', data: [0, 0, 0, 0] }
          ]
        }
      }
    };

    // If no meals, return the empty structure
    if (!userMeals || userMeals.length === 0) {
      return NextResponse.json({
        data: emptyData
      });
    }

    // Process meal data
    // For simplicity, we're just adding the meals to the daily data
    // without complex calculations for now
    const responseData = {
      ...emptyData,
      daily: {
        ...emptyData.daily,
        meals: userMeals
      }
    };

    // Return the data
    return NextResponse.json({
      data: responseData
    });
  } catch (error) {
    console.error('Error in nutrition data API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
