import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import { Meal } from '@/models/Meal';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

// Get nutrition summary for a specific time period
export async function GET(request) {
  try {
    await connectDB();
    
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // 'day', 'week', 'month', 'year'
    
    // Calculate date range based on period
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to week
    }
    
    // Get meals in the date range
    const meals = await Meal.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // For daily summary, group by day
    if (period === 'day') {
      // Format meals by meal time
      const summary = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };
      
      meals.forEach(meal => {
        if (summary[meal.mealTime]) {
          summary[meal.mealTime].push({
            id: meal._id,
            name: meal.name,
            calories: meal.totalCalories,
            protein: meal.totalProtein,
            carbs: meal.totalCarbs,
            fat: meal.totalFat,
            time: meal.date
          });
        }
      });
      
      // Calculate totals
      const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
      
      meals.forEach(meal => {
        totals.calories += meal.totalCalories;
        totals.protein += meal.totalProtein;
        totals.carbs += meal.totalCarbs;
        totals.fat += meal.totalFat;
      });
      
      return NextResponse.json({ summary, totals });
    }
    
    // For weekly, monthly, yearly summary, group by day
    const dailySummary = {};
    
    meals.forEach(meal => {
      const dateStr = meal.date.toISOString().split('T')[0];
      
      if (!dailySummary[dateStr]) {
        dailySummary[dateStr] = {
          date: dateStr,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          meals: []
        };
      }
      
      dailySummary[dateStr].calories += meal.totalCalories;
      dailySummary[dateStr].protein += meal.totalProtein;
      dailySummary[dateStr].carbs += meal.totalCarbs;
      dailySummary[dateStr].fat += meal.totalFat;
      dailySummary[dateStr].meals.push({
        id: meal._id,
        name: meal.name,
        mealTime: meal.mealTime,
        calories: meal.totalCalories
      });
    });
    
    // Convert to array and sort by date
    const summaryArray = Object.values(dailySummary).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Calculate average daily intake
    const averages = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    if (summaryArray.length > 0) {
      let totalDays = summaryArray.length;
      
      summaryArray.forEach(day => {
        averages.calories += day.calories;
        averages.protein += day.protein;
        averages.carbs += day.carbs;
        averages.fat += day.fat;
      });
      
      averages.calories = Math.round(averages.calories / totalDays);
      averages.protein = Math.round(averages.protein / totalDays);
      averages.carbs = Math.round(averages.carbs / totalDays);
      averages.fat = Math.round(averages.fat / totalDays);
    }
    
    return NextResponse.json({ 
      summary: summaryArray, 
      averages,
      period,
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Nutrition summary error:', error);
    return NextResponse.json({ error: 'Failed to get nutrition summary' }, { status: 500 });
  }
}
