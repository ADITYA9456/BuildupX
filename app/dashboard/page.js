'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MealTracker from '../components/dashboard/MealTracker';
import NutritionChart from '../components/dashboard/NutritionChart';
import EnhancedNavbar from '../components/EnhancedNavbar';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [nutritionPeriod, setNutritionPeriod] = useState('weekly');
  const [nutritionData, setNutritionData] = useState({
    daily: { 
      meals: [],
      summary: {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0
      }
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
      }
    }
  });
  
  // Direct access to daily nutrition values for UI responsiveness
  const [dailyIntake, setDailyIntake] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });
  
  const [profileData, setProfileData] = useState(null);
  
  useEffect(() => {
    // If auth context is done loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
    
    // Once auth is loaded, stop the loading state
    if (!loading) {
      setIsLoading(false);
      fetchProfileData();
      fetchNutritionData();
      
      // Listen for nutrition data updates (when meals are added)
      const handleNutritionUpdate = (event) => {
        console.log('Nutrition data updated event received', event.detail);
        if (event.detail) {
          setNutritionData({
            daily: event.detail.daily || { meals: [] },
            weekly: event.detail.weekly || { days: [] },
            monthly: event.detail.monthly || { days: [] },
            yearly: event.detail.yearly || { months: [] }
          });
        }
      };
      
      // Add event listener
      document.addEventListener('nutrition-data-updated', handleNutritionUpdate);
      
      // Cleanup
      return () => {
        document.removeEventListener('nutrition-data-updated', handleNutritionUpdate);
      };
    }
  }, [loading, user, router]);
  
  const fetchProfileData = async () => {
    try {
      console.log('Fetching user profile data...');
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Profile API error:', response.status, errorData);
        throw new Error(`Failed to fetch profile: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('Profile data received:', data);
      
      if (data && data.profile) {
        setProfileData(data.profile);
      } else {
        console.warn('Profile data is missing or empty');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setToast({
        show: true,
        message: 'Failed to load profile data: ' + error.message,
        type: 'error'
      });
    }
  };
  
  const fetchNutritionData = async () => {
    try {
      // Add a unique timestamp to force a fresh request (no caching)
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/nutrition/data?t=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'cache-control': 'no-cache, no-store, must-revalidate',
          'pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Nutrition API error:', response.status, errorData);
        throw new Error(`Failed to fetch nutrition data: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      console.log('Fetched nutrition data:', data);
      
      // If we have no meal data, set empty structures instead of mock data
      const dailyData = data.data.daily || { meals: [] };
      
      setNutritionData({
        daily: dailyData,
        weekly: data.data.weekly || { 
          days: [],
          averages: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            calories: [0, 0, 0, 0, 0, 0, 0],
            protein: [0, 0, 0, 0, 0, 0, 0],
            carbs: [0, 0, 0, 0, 0, 0, 0],
            fat: [0, 0, 0, 0, 0, 0, 0],
            fiber: [0, 0, 0, 0, 0, 0, 0]
          }
        },
        monthly: data.data.monthly || { 
          days: [],
          averages: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            calories: [0, 0, 0, 0],
            protein: [0, 0, 0, 0],
            carbs: [0, 0, 0, 0],
            fat: [0, 0, 0, 0],
            fiber: [0, 0, 0, 0]
          }
        },
        yearly: data.data.yearly || { 
          months: [],
          averages: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            calories: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            protein: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            carbs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            fat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            fiber: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        }
      });
      
      // Calculate and set daily totals separately for immediate UI update
      let totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      };
      
      // Use the summary if available, otherwise calculate from meals
      if (dailyData.summary) {
        totals.calories = dailyData.summary.totalCalories || 0;
        totals.protein = dailyData.summary.totalProtein || 0;
        totals.carbs = dailyData.summary.totalCarbs || 0;
        totals.fat = dailyData.summary.totalFat || 0;
        totals.fiber = dailyData.summary.totalFiber || 0;
      } else if (dailyData.meals && dailyData.meals.length > 0) {
        dailyData.meals.forEach(meal => {
          totals.calories += meal.totalCalories || 0;
          totals.protein += meal.totalProtein || 0;
          totals.carbs += meal.totalCarbs || 0;
          totals.fat += meal.totalFat || 0;
          // Calculate fiber from foods if available
          if (meal.foods) {
            meal.foods.forEach(food => {
              const quantity = food.quantity || 1;
              totals.fiber += ((food.food?.fiber || 0) * quantity);
            });
          }
        });
      }
      
      // Set daily intake values for immediate UI update
      setDailyIntake(totals);
      
      // Show toast to confirm data is updated
      setToast({
        show: true,
        message: 'Nutrition data updated',
        type: 'success'
      });
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      
      // Set empty data structures if fetch fails
      setNutritionData({
        daily: { meals: [] },
        weekly: { days: [] },
        monthly: { days: [] },
        yearly: { months: [] }
      });
      
      // Reset daily intake
      setDailyIntake({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      });
      
      // Show error toast with more specific message
      let errorMessage = 'Failed to update nutrition data';
      if (error.message.includes('401')) {
        errorMessage = 'Please log in again to view your data';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error - please try again later';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - please check your connection';
      }
      
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-xl text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <EnhancedNavbar />
      <main className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen pt-24 px-4 pb-12">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
        
        <div className="max-w-7xl mx-auto">
          {/* Welcome section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name || 'Member'}!</h1>
            <p className="text-gray-400">Track your nutrition and progress with your {user?.membership?.plan || 'STANDARD'} membership</p>
          </motion.div>
          
          {/* Dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Meal tracker */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <MealTracker 
                  userId={user?._id} 
                  onMealAdded={(mealData) => {
                    // Immediate update for better UX while we fetch complete data
                    if (mealData) {
                      // Add new meal to nutrition data
                      setNutritionData(prev => {
                        const updatedDaily = {
                          ...prev.daily,
                          meals: [...(prev.daily.meals || []), mealData]
                        };
                        
                        return {
                          ...prev,
                          daily: updatedDaily
                        };
                      });
                      
                      // Immediately update daily intake values for progress bars
                      if (mealData.nutritionUpdate) {
                        setDailyIntake(prevIntake => ({
                          calories: prevIntake.calories + mealData.nutritionUpdate.calories,
                          protein: prevIntake.protein + mealData.nutritionUpdate.protein,
                          carbs: prevIntake.carbs + mealData.nutritionUpdate.carbs,
                          fat: prevIntake.fat + mealData.nutritionUpdate.fat,
                          fiber: prevIntake.fiber + mealData.nutritionUpdate.fiber
                        }));
                      }
                      setDailyIntake(prev => {
                        const nutritionTotals = mealData.nutritionTotals || {
                          calories: mealData.totalCalories || 0,
                          protein: mealData.totalProtein || 0,
                          carbs: mealData.totalCarbs || 0,
                          fat: mealData.totalFat || 0,
                          fiber: mealData.totalFiber || 0
                        };
                        
                        return {
                          calories: prev.calories + nutritionTotals.calories,
                          protein: prev.protein + nutritionTotals.protein,
                          carbs: prev.carbs + nutritionTotals.carbs,
                          fat: prev.fat + nutritionTotals.fat,
                          fiber: prev.fiber + (nutritionTotals.fiber || 0)
                        };
                      });
                      
                      // Show success message
                      setToast({
                        show: true,
                        message: `${mealData.type.charAt(0).toUpperCase() + mealData.type.slice(1)} added successfully!`,
                        type: 'success'
                      });
                    }
                    
                    // Then fetch full data from the server (after a short delay)
                    setTimeout(() => {
                      fetchNutritionData();
                    }, 500);
                  }}
                />
              </motion.div>
            </div>
            
            {/* Right column - Profile & stats */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-xl p-6 shadow-lg mb-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">Your Profile</h2>
                
                <div className="space-y-3 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Membership:</span>
                    <span className="font-semibold">{profileData?.membership || 'STANDARD'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Height:</span>
                    <span>{profileData?.profile?.height || '--'} cm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Weight:</span>
                    <span>{profileData?.profile?.weight || '--'} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">BMI:</span>
                    <span>
                      {profileData?.profile?.height && profileData?.profile?.weight 
                        ? (profileData.profile.weight / ((profileData.profile.height / 100) ** 2)).toFixed(1) 
                        : '--'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Goal:</span>
                    <span className="capitalize">{profileData?.profile?.goal || '--'}</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-white mb-4">Daily Target</h2>
                
                {/* Calculate daily intake totals from nutrition data */}
                {(() => {
                  // Calculate targets based on user profile data
                  const calculateTargets = () => {
                    if (!profileData || !profileData.profile) {
                      return {
                        calories: 2000,
                        protein: 120,
                        carbs: 250,
                        fat: 65
                      };
                    }
                    
                    const { height, weight, age, gender, goal } = profileData.profile;
                    
                    // Basic BMR calculation (Mifflin-St Jeor equation)
                    let bmr = 0;
                    if (gender === 'male') {
                      bmr = 10 * (weight || 70) + 6.25 * (height || 170) - 5 * (age || 30) + 5;
                    } else {
                      bmr = 10 * (weight || 60) + 6.25 * (height || 160) - 5 * (age || 30) - 161;
                    }
                    
                    // Activity multiplier (assuming moderate activity)
                    const activityMultiplier = 1.5;
                    
                    // Calculate TDEE (Total Daily Energy Expenditure)
                    let calories = bmr * activityMultiplier;
                    
                    // Adjust based on goal
                    if (goal === 'lose') {
                      calories *= 0.8; // 20% deficit for weight loss
                    } else if (goal === 'gain') {
                      calories *= 1.15; // 15% surplus for weight gain
                    }
                    
                    // Calculate macronutrients
                    // Protein: 1.8g per kg for gain, 2g for lose, 1.6g for maintain
                    let proteinPerKg = 1.6;
                    if (goal === 'gain') proteinPerKg = 1.8;
                    if (goal === 'lose') proteinPerKg = 2.0;
                    
                    const protein = proteinPerKg * (weight || 70);
                    
                    // Fat: 25% of calories
                    const fat = (calories * 0.25) / 9;
                    
                    // Carbs: remaining calories
                    const carbs = (calories - (protein * 4) - (fat * 9)) / 4;
                    
                    // Fiber: 14g per 1000 calories is a good target
                    const fiber = Math.round(calories / 1000 * 14);
                    
                    return {
                      calories: Math.round(calories),
                      protein: Math.round(protein),
                      carbs: Math.round(carbs),
                      fat: Math.round(fat),
                      fiber: fiber
                    };
                  };
                  
                  // Get personalized targets
                  const targets = calculateTargets();
                  
                  // Use the directly maintained dailyIntake state for immediate updates
                  // This makes sure the UI updates instantly when meals are added
                  const intake = dailyIntake;
                  
                  // Calculate percentages for progress bars
                  const percentages = {
                    calories: Math.min(100, (intake.calories / targets.calories) * 100),
                    protein: Math.min(100, (intake.protein / targets.protein) * 100),
                    carbs: Math.min(100, (intake.carbs / targets.carbs) * 100),
                    fat: Math.min(100, (intake.fat / targets.fat) * 100),
                    fiber: Math.min(100, (intake.fiber / targets.fiber) * 100)
                  };
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400">Calories</span>
                          <span className="text-white">{Math.round(intake.calories)} / {targets.calories} kcal</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentages.calories}%` }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400">Protein</span>
                          <span className="text-white">{Math.round(intake.protein)} / {targets.protein} g</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentages.protein}%` }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400">Carbs</span>
                          <span className="text-white">{Math.round(intake.carbs)} / {targets.carbs} g</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${percentages.carbs}%` }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400">Fat</span>
                          <span className="text-white">{Math.round(intake.fat)} / {targets.fat} g</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${percentages.fat}%` }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400">Fiber</span>
                          <span className="text-white">{Math.round(intake.fiber)} / {targets.fiber} g</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${percentages.fiber}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </div>
          </div>
          
          {/* Nutrition history */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Nutrition History</h2>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setNutritionPeriod('weekly')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      nutritionPeriod === 'weekly'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setNutritionPeriod('monthly')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      nutritionPeriod === 'monthly'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setNutritionPeriod('yearly')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      nutritionPeriod === 'yearly'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              
              <div className="h-[300px] relative">
                <NutritionChart
                  dailyData={nutritionData.daily}
                  weeklyData={nutritionData.weekly}
                  monthlyData={nutritionData.monthly}
                  yearlyData={nutritionData.yearly}
                  period={nutritionPeriod}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
