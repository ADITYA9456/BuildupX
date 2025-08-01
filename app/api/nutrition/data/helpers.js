// Helper function to summarize meals by day
export function summarizeMealsByDay(meals) {
  const days = {};
  
  if (!meals || !Array.isArray(meals) || meals.length === 0) {
    return [];
  }
  
  meals.forEach(meal => {
    try {
      if (!meal.date) {
        console.error('Meal missing date:', meal);
        return;
      }
      const dateStr = new Date(meal.date).toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!days[dateStr]) {
      days[dateStr] = {
        date: dateStr,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        meals: []
      };
    }
    
    days[dateStr].totalCalories += meal.totalCalories || 0;
    days[dateStr].totalProtein += meal.totalProtein || 0;
    days[dateStr].totalCarbs += meal.totalCarbs || 0;
    days[dateStr].totalFat += meal.totalFat || 0;
    
    // Ensure we have fiber data
    if (meal.foods) {
      let fiberTotal = 0;
      meal.foods.forEach(item => {
        fiberTotal += ((item.food?.fiber || 0) * (item.quantity || 1));
      });
      days[dateStr].totalFiber += fiberTotal;
    }
    
    days[dateStr].meals.push(meal);
    } catch (error) {
      console.error('Error processing meal in summarizeMealsByDay:', error);
    }
  });
  
  if (Object.keys(days).length === 0) {
    return [];
  }
  
  // Convert to array sorted by date
  try {
    return Object.values(days).sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error sorting in summarizeMealsByDay:', error);
    return Object.values(days);
  }
}

// Format date for nice display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Get day of week
function getDayOfWeek(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Helper function to get weekly averages for charts
export function getWeeklyAverages(dailySummaries) {
  if (!dailySummaries || dailySummaries.length === 0) {
    return {
      labels: [],
      calories: [],
      protein: [],
      carbs: [],
      fat: [],
      fiber: []
    };
  }

  // Get the last 7 days or fewer if we don't have 7 days of data
  const recentDays = dailySummaries.slice(-7);
  
  return {
    labels: recentDays.map(day => getDayOfWeek(day.date)),
    calories: recentDays.map(day => Math.round(day.totalCalories || 0)),
    protein: recentDays.map(day => Math.round(day.totalProtein || 0)),
    carbs: recentDays.map(day => Math.round(day.totalCarbs || 0)),
    fat: recentDays.map(day => Math.round(day.totalFat || 0)),
    fiber: recentDays.map(day => Math.round(day.totalFiber || 0))
  };
}

// Helper function to get monthly averages for charts
export function getMonthlyAverages(dailySummaries) {
  if (!dailySummaries || dailySummaries.length === 0) {
    return {
      labels: [],
      calories: [],
      protein: [],
      carbs: [],
      fat: [],
      fiber: []
    };
  }

  // Group by week for monthly view
  const weeklyData = {};
  
  dailySummaries.forEach(day => {
    const date = new Date(day.date);
    // Get week number (0-3) within the month
    const weekNum = Math.floor(date.getDate() / 7);
    const weekKey = `Week ${weekNum + 1}`;
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        count: 0,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0
      };
    }
    
    weeklyData[weekKey].count++;
    weeklyData[weekKey].totalCalories += day.totalCalories || 0;
    weeklyData[weekKey].totalProtein += day.totalProtein || 0;
    weeklyData[weekKey].totalCarbs += day.totalCarbs || 0;
    weeklyData[weekKey].totalFat += day.totalFat || 0;
    weeklyData[weekKey].totalFiber += day.totalFiber || 0;
  });
  
  // Calculate averages and format for chart
  const weekKeys = Object.keys(weeklyData).sort();
  
  return {
    labels: weekKeys,
    calories: weekKeys.map(key => Math.round((weeklyData[key].totalCalories / weeklyData[key].count) || 0)),
    protein: weekKeys.map(key => Math.round((weeklyData[key].totalProtein / weeklyData[key].count) || 0)),
    carbs: weekKeys.map(key => Math.round((weeklyData[key].totalCarbs / weeklyData[key].count) || 0)),
    fat: weekKeys.map(key => Math.round((weeklyData[key].totalFat / weeklyData[key].count) || 0)),
    fiber: weekKeys.map(key => Math.round((weeklyData[key].totalFiber / weeklyData[key].count) || 0))
  };
}
