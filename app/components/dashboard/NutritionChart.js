'use client';

import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';

export default function NutritionChart({ dailyData, weeklyData, monthlyData, yearlyData, period = 'weekly' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  // Check if data is empty
  const isDataEmpty = () => {
    if (period === 'daily' && (!dailyData?.meals || dailyData.meals.length === 0)) {
      return true;
    }
    if (period === 'weekly' && (!weeklyData?.days || weeklyData.days.length === 0)) {
      return true;
    }
    if (period === 'monthly' && (!monthlyData?.days || monthlyData.days.length === 0)) {
      return true;
    }
    if (period === 'yearly') {
      // Check if yearly data exists, otherwise fall back to monthly data
      if (yearlyData && yearlyData.months && yearlyData.months.length > 0) {
        return false;
      } else {
        // Fall back to monthly data if no specific yearly data
        return (!monthlyData?.days || monthlyData.days.length === 0);
      }
    }
    return false;
  };

  const prepareData = (data) => {
    // If no data or empty data, return empty datasets
    if (!data || 
        (data.meals && data.meals.length === 0) || 
        (data.days && data.days.length === 0) ||
        (data.months && data.months.length === 0)) {
      
      // Generate appropriate labels based on period
      let emptyLabels;
      if (period === 'daily') {
        emptyLabels = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']; 
      } else if (period === 'weekly') {
        emptyLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      } else if (period === 'monthly') {
        emptyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      } else if (period === 'yearly') {
        emptyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      } else {
        emptyLabels = ['No data'];
      }
      
      return {
        labels: emptyLabels,
        caloriesData: emptyLabels.map(() => 0),
        proteinData: emptyLabels.map(() => 0),
        carbsData: emptyLabels.map(() => 0),
        fatData: emptyLabels.map(() => 0),
        fiberData: emptyLabels.map(() => 0)
      };
    }
    
    // If viewing daily, show meal-by-meal breakdown
    if (period === 'daily') {
      const labels = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
      
      // Group data by meal type
      const mealTotals = data.meals.reduce((acc, meal) => {
        if (!acc[meal.type]) {
          acc[meal.type] = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          };
        }
        
          acc[meal.type].calories += meal.totalCalories;
        acc[meal.type].protein += meal.totalProtein;
        acc[meal.type].carbs += meal.totalCarbs;
        acc[meal.type].fat += meal.totalFat;
        acc[meal.type].fiber += meal.totalFiber || 0;        return acc;
      }, {});
      
      // Prepare datasets
      return {
        labels,
        caloriesData: labels.map(label => mealTotals[label.toLowerCase()]?.calories || 0),
        proteinData: labels.map(label => mealTotals[label.toLowerCase()]?.protein || 0),
        carbsData: labels.map(label => mealTotals[label.toLowerCase()]?.carbs || 0),
        fatData: labels.map(label => mealTotals[label.toLowerCase()]?.fat || 0),
        fiberData: labels.map(label => mealTotals[label.toLowerCase()]?.fiber || 0)
      };
    } 
    // If viewing weekly/monthly/yearly, use the pre-calculated data from our API
    else {
      const result = {
        labels: [],
        caloriesData: [],
        proteinData: [],
        carbsData: [],
        fatData: [],
        fiberData: []
      };
      
      // For weekly: use weeklyData
      if (period === 'weekly' && data.averages) {
        result.labels = data.averages.labels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        result.caloriesData = data.averages.calories || [0, 0, 0, 0, 0, 0, 0];
        result.proteinData = data.averages.protein || [0, 0, 0, 0, 0, 0, 0];
        result.carbsData = data.averages.carbs || [0, 0, 0, 0, 0, 0, 0];
        result.fatData = data.averages.fat || [0, 0, 0, 0, 0, 0, 0];
        result.fiberData = data.averages.fiber || [0, 0, 0, 0, 0, 0, 0];
      } 
      // For monthly: use monthlyData
      else if (period === 'monthly' && data.averages) {
        result.labels = data.averages.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        result.caloriesData = data.averages.calories || [0, 0, 0, 0];
        result.proteinData = data.averages.protein || [0, 0, 0, 0];
        result.carbsData = data.averages.carbs || [0, 0, 0, 0];
        result.fatData = data.averages.fat || [0, 0, 0, 0];
        result.fiberData = data.averages.fiber || [0, 0, 0, 0];
      }
      // For yearly: use yearlyData with improved handling
      else if (period === 'yearly' && data.averages) {
        result.labels = data.averages.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Check for data in each nutrient category
        const hasData = 
          (data.averages.calories && data.averages.calories.some(val => val > 0)) ||
          (data.averages.protein && data.averages.protein.some(val => val > 0)) ||
          (data.averages.carbs && data.averages.carbs.some(val => val > 0)) ||
          (data.averages.fat && data.averages.fat.some(val => val > 0));
          
        result.caloriesData = data.averages.calories || Array(12).fill(0);
        result.proteinData = data.averages.protein || Array(12).fill(0);
        result.carbsData = data.averages.carbs || Array(12).fill(0);
        result.fatData = data.averages.fat || Array(12).fill(0);
        result.fiberData = data.averages.fiber || Array(12).fill(0);
      }
      // Fallback to handling raw day data if averages aren't available
      else if (data.days && data.days.length > 0) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        result.labels = days;
        
        // Initialize data for each day
        const dayTotals = data.days.reduce((acc, dayData) => {
          const dayName = new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'long' });
          if (!acc[dayName]) {
            acc[dayName] = {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0
            };
          }
          
          acc[dayName].calories += dayData.totalCalories;
          acc[dayName].protein += dayData.totalProtein;
          acc[dayName].carbs += dayData.totalCarbs;
          acc[dayName].fat += dayData.totalFat;
          acc[dayName].fiber += dayData.totalFiber || 0;
          
          return acc;
        }, {});
        
        // Map to arrays
        result.caloriesData = days.map(day => dayTotals[day]?.calories || 0);
        result.proteinData = days.map(day => dayTotals[day]?.protein || 0);
        result.carbsData = days.map(day => dayTotals[day]?.carbs || 0);
        result.fatData = days.map(day => dayTotals[day]?.fat || 0);
        result.fiberData = days.map(day => dayTotals[day]?.fiber || 0);
      } 
      // For monthly: group by date
      else if (period === 'monthly') {
        // Sort days by date
        const sortedDays = [...data.days].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Extract the data
        result.labels = sortedDays.map(day => new Date(day.date).getDate());
        result.caloriesData = sortedDays.map(day => day.totalCalories);
        result.proteinData = sortedDays.map(day => day.totalProtein);
        result.carbsData = sortedDays.map(day => day.totalCarbs);
        result.fatData = sortedDays.map(day => day.totalFat);
        result.fiberData = sortedDays.map(day => day.totalFiber || 0);
      } 
      // For yearly: group by month
      else if (period === 'yearly') {
        // Define month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        result.labels = monthNames;
        
        // Initialize monthly totals
        const monthlyTotals = Array(12).fill().map(() => ({
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          count: 0
        }));
        
        // Group data by month
        if (data.days && data.days.length > 0) {
          data.days.forEach(day => {
            const date = new Date(day.date);
            const month = date.getMonth();
            
            monthlyTotals[month].calories += day.totalCalories || 0;
            monthlyTotals[month].protein += day.totalProtein || 0;
            monthlyTotals[month].carbs += day.totalCarbs || 0;
            monthlyTotals[month].fat += day.totalFat || 0;
            monthlyTotals[month].fiber += day.totalFiber || 0;
            monthlyTotals[month].count += 1;
          });
        }
        
        // Extract averages for each month
        result.caloriesData = monthlyTotals.map(month => month.count ? month.calories / month.count : 0);
        result.proteinData = monthlyTotals.map(month => month.count ? month.protein / month.count : 0);
        result.carbsData = monthlyTotals.map(month => month.count ? month.carbs / month.count : 0);
        result.fatData = monthlyTotals.map(month => month.count ? month.fat / month.count : 0);
        result.fiberData = monthlyTotals.map(month => month.count ? month.fiber / month.count : 0);
      }
      
      return result;
    }
  };

  useEffect(() => {
    // Select appropriate data based on period
    let data;
    if (period === 'daily') {
      data = dailyData;
    } else if (period === 'weekly') {
      data = weeklyData;
    } else if (period === 'yearly') {
      // Use dedicated yearly data if available
      data = yearlyData || { 
        // If no yearly data, provide empty structure
        averages: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          calories: Array(12).fill(0),
          protein: Array(12).fill(0),
          carbs: Array(12).fill(0),
          fat: Array(12).fill(0),
          fiber: Array(12).fill(0)
        }
      };
    } else {
      data = monthlyData;
    }
    
    if (!chartRef.current) return;
    
    // Check if we have any data
    const hasData = data && 
      ((data.meals && data.meals.length > 0) || 
       (data.days && data.days.length > 0) ||
       (data.months && data.months.length > 0) ||
       (data.averages && Object.keys(data.averages).length > 0));
    
    // Handle no data case
    if (!hasData) {
      // Destroy previous chart if exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      
      // Add a no-data message to the chart container only if there's really no data
      const container = chartRef.current.parentNode;
      
      // Clear any previous no-data message
      const existingMessage = container.querySelector('.no-data-message');
      if (existingMessage) {
        container.removeChild(existingMessage);
      }
      
      // Check if any period has data before showing no data message
      const anyPeriodHasData = 
        (dailyData && dailyData.meals && dailyData.meals.length > 0) || 
        (weeklyData && weeklyData.days && weeklyData.days.length > 0) ||
        (monthlyData && monthlyData.days && monthlyData.days.length > 0) ||
        (yearlyData && yearlyData.months && yearlyData.months.length > 0) ||
        (weeklyData && weeklyData.averages && Object.keys(weeklyData.averages).length > 0) ||
        (monthlyData && monthlyData.averages && Object.keys(monthlyData.averages).length > 0) ||
        (yearlyData && yearlyData.averages && Object.keys(yearlyData.averages).length > 0);
      
      if (!anyPeriodHasData && !container.querySelector('.no-data-message')) {
        const message = document.createElement('div');
        message.className = 'no-data-message';
        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.fontSize = '16px';
        message.style.color = '#999';
        message.textContent = 'No nutrition data tracked yet';
        container.style.position = 'relative';
        container.appendChild(message);
      }
      
      return;
    }
    
    // Destroy previous chart if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const { labels, caloriesData, proteinData, carbsData, fatData, fiberData } = prepareData(data);
    
    // Create the new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Protein (g)',
            data: proteinData,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: 'Carbs (g)',
            data: carbsData,
            backgroundColor: 'rgba(250, 204, 21, 0.7)',
            borderColor: 'rgb(250, 204, 21)',
            borderWidth: 1
          },
          {
            label: 'Fat (g)',
            data: fatData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1
          },
          {
            label: 'Fiber (g)',
            data: fiberData,
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'white',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              footer: (tooltipItems) => {
                // Calculate calories for the hovered item
                const index = tooltipItems[0].dataIndex;
                return `Calories: ${caloriesData[index]} kcal`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    });
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [period, dailyData, weeklyData, monthlyData, yearlyData]);

  return (
    <div className="w-full h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
