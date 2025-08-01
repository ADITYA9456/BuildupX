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
      },
      yearly: {
        months: [],
        averages: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          calories: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          protein: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          carbs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          fat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          fiber: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        chartData: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            { label: 'Calories', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            { label: 'Protein', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            { label: 'Carbs', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            { label: 'Fat', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            { label: 'Fiber', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
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

    // Process meal data properly with calculations for all time periods
    const responseData = {
      ...emptyData,
      daily: processDailyMeals(userMeals, today),
      weekly: processWeeklyMeals(userMeals),
      monthly: processMonthlyMeals(userMeals),
      yearly: processYearlyMeals(userMeals)
    };

    // Return the processed data
    return NextResponse.json({
      data: responseData
    });
  } catch (error) {
    console.error('Error in nutrition data API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Helper function to process daily meals
function processDailyMeals(meals, today) {
  // Filter today's meals
  const todayStart = new Date(today);
  const todayEnd = new Date(today);
  todayEnd.setDate(todayEnd.getDate() + 1);
  
  const todayMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date);
    return mealDate >= todayStart && mealDate < todayEnd;
  });

  // Calculate daily summary
  const summary = {
    date: today.toISOString().split('T')[0],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0
  };

  todayMeals.forEach(meal => {
    summary.totalCalories += meal.totalCalories || 0;
    summary.totalProtein += meal.totalProtein || 0;
    summary.totalCarbs += meal.totalCarbs || 0;
    summary.totalFat += meal.totalFat || 0;
    summary.totalFiber += meal.totalFiber || 0;
  });

  return {
    summary,
    meals: todayMeals
  };
}

// Helper function to process weekly meals
function processWeeklyMeals(meals) {
  // Get start of current week (Sunday)
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Create array for days of the week
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    daysOfWeek.push(day);
  }
  
  // Process meals by day
  const dayData = daysOfWeek.map(day => {
    const dayStart = new Date(day);
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    // Filter meals for this day
    const dayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= dayStart && mealDate < dayEnd;
    });
    
    // Calculate totals for the day
    const dayTotals = {
      date: day.toISOString().split('T')[0],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0
    };
    
    dayMeals.forEach(meal => {
      dayTotals.totalCalories += meal.totalCalories || 0;
      dayTotals.totalProtein += meal.totalProtein || 0;
      dayTotals.totalCarbs += meal.totalCarbs || 0;
      dayTotals.totalFat += meal.totalFat || 0;
      dayTotals.totalFiber += meal.totalFiber || 0;
    });
    
    return dayTotals;
  });
  
  // Create data for chart
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calories = dayData.map(day => day.totalCalories);
  const protein = dayData.map(day => day.totalProtein);
  const carbs = dayData.map(day => day.totalCarbs);
  const fat = dayData.map(day => day.totalFat);
  const fiber = dayData.map(day => day.totalFiber);
  
  return {
    days: dayData,
    averages: {
      labels,
      calories,
      protein,
      carbs,
      fat,
      fiber
    },
    chartData: {
      labels,
      datasets: [
        { label: 'Calories', data: calories },
        { label: 'Protein', data: protein },
        { label: 'Carbs', data: carbs },
        { label: 'Fat', data: fat },
        { label: 'Fiber', data: fiber }
      ]
    }
  };
}

// Helper function to process monthly meals
function processMonthlyMeals(meals) {
  // Get start of current month
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Get number of days in the month
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  // Create array for days of the month
  const daysOfMonth = [];
  for (let i = 0; i < daysInMonth; i++) {
    const day = new Date(startOfMonth);
    day.setDate(startOfMonth.getDate() + i);
    daysOfMonth.push(day);
  }
  
  // Process meals by day
  const dayData = daysOfMonth.map(day => {
    const dayStart = new Date(day);
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    // Filter meals for this day
    const dayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= dayStart && mealDate < dayEnd;
    });
    
    // Calculate totals for the day
    const dayTotals = {
      date: day.toISOString().split('T')[0],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0
    };
    
    dayMeals.forEach(meal => {
      dayTotals.totalCalories += meal.totalCalories || 0;
      dayTotals.totalProtein += meal.totalProtein || 0;
      dayTotals.totalCarbs += meal.totalCarbs || 0;
      dayTotals.totalFat += meal.totalFat || 0;
      dayTotals.totalFiber += meal.totalFiber || 0;
    });
    
    return dayTotals;
  });
  
  // Group days into weeks for the weekly averages
  const weeklyData = [];
  for (let week = 0; week < 5; week++) {
    const startDay = week * 7;
    const endDay = Math.min((week + 1) * 7, dayData.length);
    
    if (startDay < dayData.length) {
      const weekDays = dayData.slice(startDay, endDay);
      
      if (weekDays.length > 0) {
        const weekTotal = {
          week: week + 1,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalFiber: 0,
          days: weekDays.length
        };
        
        weekDays.forEach(day => {
          weekTotal.totalCalories += day.totalCalories;
          weekTotal.totalProtein += day.totalProtein;
          weekTotal.totalCarbs += day.totalCarbs;
          weekTotal.totalFat += day.totalFat;
          weekTotal.totalFiber += day.totalFiber;
        });
        
        weeklyData.push(weekTotal);
      }
    }
  }
  
  // Create data for chart
  const labels = weeklyData.map(week => `Week ${week.week}`);
  const calories = weeklyData.map(week => week.totalCalories / (week.days || 1));
  const protein = weeklyData.map(week => week.totalProtein / (week.days || 1));
  const carbs = weeklyData.map(week => week.totalCarbs / (week.days || 1));
  const fat = weeklyData.map(week => week.totalFat / (week.days || 1));
  const fiber = weeklyData.map(week => week.totalFiber / (week.days || 1));
  
  return {
    days: dayData,
    weeks: weeklyData,
    averages: {
      labels,
      calories,
      protein,
      carbs,
      fat,
      fiber
    },
    chartData: {
      labels,
      datasets: [
        { label: 'Calories', data: calories },
        { label: 'Protein', data: protein },
        { label: 'Carbs', data: carbs },
        { label: 'Fat', data: fat },
        { label: 'Fiber', data: fiber }
      ]
    }
  };
}

// Helper function to process yearly meals
function processYearlyMeals(meals) {
  // Get current year
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Create array for months of the year
  const monthsData = [];
  for (let month = 0; month < 12; month++) {
    // Create start and end dates for the month
    const monthStart = new Date(currentYear, month, 1);
    const monthEnd = new Date(currentYear, month + 1, 0);
    
    // Filter meals for this month
    const monthMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= monthStart && mealDate <= monthEnd;
    });
    
    // Calculate totals for the month
    const monthTotals = {
      month,
      monthName: monthStart.toLocaleString('default', { month: 'short' }),
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      days: monthMeals.length > 0 ? new Set(monthMeals.map(m => new Date(m.date).getDate())).size : 0
    };
    
    monthMeals.forEach(meal => {
      monthTotals.totalCalories += meal.totalCalories || 0;
      monthTotals.totalProtein += meal.totalProtein || 0;
      monthTotals.totalCarbs += meal.totalCarbs || 0;
      monthTotals.totalFat += meal.totalFat || 0;
      monthTotals.totalFiber += meal.totalFiber || 0;
    });
    
    monthsData.push(monthTotals);
  }
  
  // Create data for chart - use averages per day if data exists
  const labels = monthsData.map(month => month.monthName);
  const calories = monthsData.map(month => month.days > 0 ? month.totalCalories / month.days : 0);
  const protein = monthsData.map(month => month.days > 0 ? month.totalProtein / month.days : 0);
  const carbs = monthsData.map(month => month.days > 0 ? month.totalCarbs / month.days : 0);
  const fat = monthsData.map(month => month.days > 0 ? month.totalFat / month.days : 0);
  const fiber = monthsData.map(month => month.days > 0 ? month.totalFiber / month.days : 0);
  
  return {
    months: monthsData,
    averages: {
      labels,
      calories,
      protein,
      carbs,
      fat,
      fiber
    },
    chartData: {
      labels,
      datasets: [
        { label: 'Calories', data: calories },
        { label: 'Protein', data: protein },
        { label: 'Carbs', data: carbs },
        { label: 'Fat', data: fat },
        { label: 'Fiber', data: fiber }
      ]
    }
  };
}
