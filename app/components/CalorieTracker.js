'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Food database with calorie values (per 100g or per standard serving)
const foodDatabase = {
  // Basics & Dairy
  "milk": 42,
  "bread": 265,
  "peanut butter": 588,
  "butter": 717,
  "cheese": 402,
  "yogurt": 59,
  "curd": 98,
  "cream": 340,
  "ghee": 900,
  "paneer": 265,
  "cottage cheese": 98,
  "oats": 389,
  "cereal": 380,
  "honey": 304,
  "jam": 250,
  
  // Indian foods
  "roti": 120,
  "naan": 260,
  "paratha": 330,
  "rice": 130,
  "dal": 120,
  "paneer": 265,
  "chicken curry": 195,
  "butter chicken": 290,
  "palak paneer": 180,
  "chana masala": 160,
  "biryani": 210,
  "samosa": 310,
  "dosa": 155,
  "idli": 85,
  "uttapam": 170,
  "vada": 180,
  "poha": 130,
  "upma": 120,
  "chapati": 120,
  "curd rice": 150,
  "rajma": 140,
  "chole": 170,
  "bhindi": 95,
  "aloo gobi": 145,
  "tandoori chicken": 235,
  
  // Fruits
  "apple": 52,
  "banana": 89,
  "orange": 47,
  "mango": 60,
  "watermelon": 30,
  "grapes": 67,
  "pomegranate": 83,
  "papaya": 43,
  "pineapple": 50,
  "kiwi": 61,
  "strawberry": 32,
  "blueberry": 57,
  "avocado": 160,
  
  // Vegetables
  "potato": 77,
  "tomato": 18,
  "onion": 40,
  "spinach": 23,
  "carrot": 41,
  "cucumber": 15,
  "broccoli": 34,
  "cauliflower": 25,
  "bell pepper": 31,
  "cabbage": 25,
  "lettuce": 15,
  "corn": 86,
  "sweet potato": 86,
  "peas": 81,
  
  // Proteins
  "egg": 78,
  "chicken breast": 165,
  "fish": 206,
  "prawns": 99,
  "mutton": 294,
  "tofu": 144,
  "chickpeas": 364,
  "black beans": 341,
  "kidney beans": 127,
  "lentils": 116,
  "almonds": 579,
  "cashews": 553,
  "peanuts": 567,
  "whey protein": 400,
  
  // Snacks & Beverages
  "popcorn": 375,
  "chips": 536,
  "biscuit": 480,
  "chocolate": 545,
  "ice cream": 207,
  "cake": 257,
  "cookies": 488,
  "pizza": 266,
  "burger": 295,
  "french fries": 312,
  "cola": 42,
  "energy drink": 45,
  "fruit juice": 45,
  "coffee": 2,
  "tea": 1,
};

export default function CalorieTracker() {
  const { user } = useAuth();
  
  // User Profile State
  const [userProfile, setUserProfile] = useState({
    weight: 70,
    height: 170,
    age: 30,
    gender: 'male',
    goal: 'maintain',
    activityLevel: 'moderate'
  });
  
  // Food Tracking State
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });
  
  // Form States
  const [foodInput, setFoodInput] = useState('');
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAllFoods, setShowAllFoods] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track total calories
  const [totalCalories, setTotalCalories] = useState(0);
  
  // Fetch user's meal history when component loads or user changes
  useEffect(() => {
    const fetchUserMealHistory = async () => {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Fetching meal data for user:", user.id);
        
        // First try to fetch user profile
        const profileResponse = await fetch(`/api/tracker/profile?userId=${user.id}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.profile) {
            console.log("Found user profile:", profileData.profile);
            setUserProfile(prevProfile => ({
              ...prevProfile,
              ...profileData.profile
            }));
            
            // Calculate calorie goal based on the profile
            const bmr = calculateBMR();
            const tdee = calculateTDEE(bmr);
            const calorieGoal = calculateCalorieGoal(tdee);
            setDailyCalorieGoal(calorieGoal);
            setFormSubmitted(true);
          }
        }
        
        // Then fetch food logs
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // Get YYYY-MM-DD
        
        console.log("Fetching food logs for date:", todayStr);
        const response = await fetch(`/api/tracker/history?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch meal history');
        }
        
        const data = await response.json();
        
        if (data.success && data.logs && data.logs.length > 0) {
          // Process the logs and organize them by meal type
          const userMeals = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
          };
          
          data.logs.forEach(log => {
            if (userMeals[log.meal]) {
              userMeals[log.meal].push({
                id: log._id,
                name: log.food,
                quantity: log.quantity,
                calories: log.calories,
                caloriesPerUnit: log.calories / log.quantity
              });
            }
          });
          
          // Update the meals state with fetched data
          setMeals(userMeals);
        }
      } catch (error) {
        console.error('Error fetching meal history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserMealHistory();
  }, [user]);
  
  useEffect(() => {
    // Calculate total calories whenever meals change
    let total = 0;
    Object.values(meals).forEach(mealItems => {
      mealItems.forEach(item => {
        total += item.calories;
      });
    });
    setTotalCalories(total);
  }, [meals]);
  
  // Calculate BMR (Mifflin-St Jeor Equation)
  const calculateBMR = () => {
    const { weight, height, age, gender } = userProfile;
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };
  
  // Calculate TDEE based on activity level
  const calculateTDEE = (bmr) => {
    const { activityLevel } = userProfile;
    const activityFactors = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very active': 1.9
    };
    return Math.round(bmr * activityFactors[activityLevel]);
  };
  
  // Calculate calorie goal based on user's goal
  const calculateCalorieGoal = (tdee) => {
    const { goal } = userProfile;
    if (goal === 'lose') {
      return Math.round(tdee - 500); // Deficit of 500 calories
    } else if (goal === 'gain') {
      return Math.round(tdee + 500); // Surplus of 500 calories
    } else {
      return tdee; // Maintenance calories
    }
  };
  
  // Handle user profile form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    // Calculate calorie goal
    const bmr = calculateBMR();
    const tdee = calculateTDEE(bmr);
    const calorieGoal = calculateCalorieGoal(tdee);
    
    setDailyCalorieGoal(calorieGoal);
    setFormSubmitted(true);
    
    // Save to database via API
    if (user && user.id) {
      fetch('/api/tracker/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userProfile,
          userId: user.id
        }),
      })
      .then(response => response.json())
      .then(data => console.log('Profile saved:', data))
      .catch(error => console.error('Error saving profile:', error));
    }
  };
  
  // Handle adding food to a meal
  const handleAddFood = (e) => {
    e.preventDefault();
    
    if (!foodInput.trim()) return;
    
    // Look up calories for the food item
    const foodName = foodInput.toLowerCase().trim();
    const calories = foodDatabase[foodName] || 0;
    
    if (calories > 0) {
      const newFoodItem = {
        id: Date.now(),
        name: foodInput,
        quantity: foodQuantity,
        calories: calories * foodQuantity,
        caloriesPerUnit: calories
      };
      
      setMeals(prevMeals => ({
        ...prevMeals,
        [selectedMeal]: [...prevMeals[selectedMeal], newFoodItem]
      }));
      
      setFoodInput('');
      setFoodQuantity(1);
      setShowSearchResults(false);
      
      // Save to database via API
      if (user && user.id) {
        fetch('/api/tracker/food-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            meal: selectedMeal,
            food: newFoodItem.name,
            quantity: newFoodItem.quantity,
            calories: newFoodItem.calories,
            date: new Date()
          }),
        })
        .then(response => response.json())
        .then(data => console.log('Food log saved:', data))
        .catch(error => console.error('Error saving food log:', error));
      }
    }
  };
  
  // Handle removing a food item
  const handleRemoveFood = (mealType, itemId) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: prevMeals[mealType].filter(item => item.id !== itemId)
    }));
  };
  
  // Update food quantity
  const updateFoodQuantity = (mealType, itemId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: prevMeals[mealType].map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            calories: item.caloriesPerUnit * newQuantity
          };
        }
        return item;
      })
    }));
  };
  
  // Handle food input change
  const handleFoodInputChange = (e) => {
    const value = e.target.value;
    setFoodInput(value);
    
    if (value.trim().length > 1) {
      // Search food database
      const results = Object.keys(foodDatabase)
        .filter(food => food.includes(value.toLowerCase()))
        .slice(0, 5); // Limit to 5 results
      
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setShowSearchResults(false);
    }
  };
  
  // Select food from search results
  const selectFood = (food) => {
    setFoodInput(food);
    setShowSearchResults(false);
  };
  
  // Quick add food options
  const quickAddOptions = [
    "bread", "milk", "peanut butter", "butter", "cheese", "rice", 
    "egg", "apple", "banana", "roti", "yogurt", "curd", "dal",
    "chicken breast", "cereal", "oats", "honey"
  ];
  
  // Helper function to categorize foods
  const categorizedFoods = () => {
    const categories = {
      "Basics & Dairy": [],
      "Indian Foods": [],
      "Fruits": [],
      "Vegetables": [],
      "Proteins": [],
      "Snacks & Beverages": []
    };
    
    // Categorize each food
    Object.keys(foodDatabase).forEach(food => {
      if (["milk", "bread", "butter", "cheese", "yogurt", "curd", "cream", "ghee", "paneer", "cottage cheese", "oats", "cereal", "honey", "jam", "peanut butter"].includes(food)) {
        categories["Basics & Dairy"].push(food);
      } else if (["roti", "naan", "paratha", "rice", "dal", "chicken curry", "butter chicken", "palak paneer", "chana masala", "biryani", "samosa", "dosa", "idli", "uttapam", "vada", "poha", "upma", "chapati", "curd rice", "rajma", "chole", "bhindi", "aloo gobi", "tandoori chicken"].includes(food)) {
        categories["Indian Foods"].push(food);
      } else if (["apple", "banana", "orange", "mango", "watermelon", "grapes", "pomegranate", "papaya", "pineapple", "kiwi", "strawberry", "blueberry", "avocado"].includes(food)) {
        categories["Fruits"].push(food);
      } else if (["potato", "tomato", "onion", "spinach", "carrot", "cucumber", "broccoli", "cauliflower", "bell pepper", "cabbage", "lettuce", "corn", "sweet potato", "peas"].includes(food)) {
        categories["Vegetables"].push(food);
      } else if (["egg", "chicken breast", "fish", "prawns", "mutton", "tofu", "chickpeas", "black beans", "kidney beans", "lentils", "almonds", "cashews", "peanuts", "whey protein"].includes(food)) {
        categories["Proteins"].push(food);
      } else {
        categories["Snacks & Beverages"].push(food);
      }
    });
    
    return categories;
  };
  
  return (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 border-opacity-50"></div>
          <p className="mt-4 text-lg text-green-400">Loading your nutrition data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: User Profile */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-green-500/20"
      >
        <h2 className="text-2xl font-bold mb-4 text-green-400">Your Profile</h2>
        
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="300"
                value={userProfile.weight || ''}
                onChange={(e) => setUserProfile({...userProfile, weight: parseFloat(e.target.value) || 0})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={userProfile.height || ''}
                onChange={(e) => setUserProfile({...userProfile, height: parseFloat(e.target.value) || 0})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Age (years)</label>
              <input
                type="number"
                min="16"
                max="120"
                value={userProfile.age || ''}
                onChange={(e) => setUserProfile({...userProfile, age: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Gender</label>
              <select
                value={userProfile.gender}
                onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Goal</label>
              <select
                value={userProfile.goal}
                onChange={(e) => setUserProfile({...userProfile, goal: e.target.value})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                required
              >
                <option value="lose">Lose Weight (Cutting)</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight (Bulking)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Activity Level</label>
              <select
                value={userProfile.activityLevel}
                onChange={(e) => setUserProfile({...userProfile, activityLevel: e.target.value})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                required
              >
                <option value="sedentary">Sedentary (Office Job)</option>
                <option value="light">Light Exercise (1-2 days/week)</option>
                <option value="moderate">Moderate Exercise (3-5 days/week)</option>
                <option value="active">Active (Daily Exercise)</option>
                <option value="very active">Very Active (Intense Daily Exercise)</option>
              </select>
            </div>
          </div>
          
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Calculate My Needs
          </motion.button>
        </form>
        
        {/* Display calculated results */}
        {formSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 p-4 bg-gray-800/60 rounded-xl border border-green-500/30"
          >
            <h3 className="text-xl font-bold text-green-400 mb-2">Your Daily Calorie Target</h3>
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                {dailyCalorieGoal} calories
              </div>
            </div>
            <p className="text-gray-300 mt-2 text-center text-sm">
              {userProfile.goal === 'lose' && "Calorie deficit for weight loss"}
              {userProfile.goal === 'maintain' && "Maintenance calories to maintain weight"}
              {userProfile.goal === 'gain' && "Calorie surplus for weight gain"}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Right column: Meal Tracker */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-green-500/20"
      >
        <h2 className="text-2xl font-bold mb-4 text-green-400">Meal Tracker</h2>
        
        {/* Food input form */}
        <form onSubmit={handleAddFood} className="mb-6 relative">
          <div className="space-y-4 mb-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm text-gray-300">Add Food Item</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowAllFoods(!showAllFoods);
                        setShowQuickAdd(false);
                        setShowSearchResults(false);
                      }}
                      className="text-xs px-2 py-0.5 bg-green-600/40 hover:bg-green-600/60 text-white rounded"
                    >
                      All Foods
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowQuickAdd(!showQuickAdd);
                        setShowAllFoods(false);
                        setShowSearchResults(false);
                      }}
                      className="text-xs px-2 py-0.5 bg-green-600/40 hover:bg-green-600/60 text-white rounded"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={foodInput}
                    onChange={handleFoodInputChange}
                    placeholder="Enter food name..."
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                  />                {/* Food search results dropdown */}
                {showSearchResults && (
                  <div className="absolute mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                    {searchResults.map((food) => (
                      <div
                        key={food}
                        className="p-3 hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                        onClick={() => selectFood(food)}
                      >
                        <span className="capitalize">{food}</span>
                        <span className="text-green-400 text-sm">{foodDatabase[food]} cal</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Quick Add options */}
                {showQuickAdd && (
                  <div className="absolute mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    <div className="p-3 bg-gray-700 sticky top-0">
                      <h3 className="text-sm font-medium text-white mb-1">Quick Add Foods</h3>
                      <p className="text-xs text-gray-300">Click on any food to quickly add it</p>
                    </div>
                    <div className="p-2 grid grid-cols-2 gap-2">
                      {quickAddOptions.map((food) => (
                        <div
                          key={food}
                          className="p-3 bg-gray-700/50 hover:bg-gray-600 rounded-lg cursor-pointer flex flex-col"
                          onClick={() => {
                            selectFood(food);
                            setShowQuickAdd(false);
                          }}
                        >
                          <span className="capitalize font-medium">{food}</span>
                          <span className="text-green-400 text-xs">{foodDatabase[food]} cal/serving</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All Foods section */}
                {showAllFoods && (
                  <div className="absolute mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                    <div className="p-3 bg-gray-700 sticky top-0">
                      <h3 className="text-sm font-medium text-white mb-1">All Available Foods</h3>
                      <p className="text-xs text-gray-300">Browse by category or search above</p>
                    </div>
                    
                    {Object.entries(categorizedFoods()).map(([category, foods]) => (
                      <div key={category} className="mb-3">
                        <div className="px-3 py-2 bg-gray-700/70 sticky top-12">
                          <h4 className="text-sm font-medium text-green-400">{category}</h4>
                        </div>
                        <div className="p-2 grid grid-cols-2 gap-1">
                          {foods.map(food => (
                            <div
                              key={food}
                              className="p-2 bg-gray-700/30 hover:bg-gray-600 rounded cursor-pointer flex flex-col"
                              onClick={() => {
                                selectFood(food);
                                setShowAllFoods(false);
                              }}
                            >
                              <span className="capitalize text-sm">{food}</span>
                              <span className="text-green-400 text-xs">{foodDatabase[food]} cal</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Meal Type</label>
                <select
                  value={selectedMeal}
                  onChange={(e) => setSelectedMeal(e.target.value)}
                  className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snacks">Snacks</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Quantity</label>
                <div className="flex items-center">
                  <button 
                    type="button"
                    onClick={() => setFoodQuantity(prev => Math.max(1, prev - 1))}
                    className="bg-gray-700 text-white px-3 py-3 rounded-l-lg hover:bg-gray-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={foodQuantity || 1}
                    onChange={(e) => setFoodQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-gray-800 text-white p-3 text-center border-y border-gray-700 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setFoodQuantity(prev => prev + 1)}
                    className="bg-gray-700 text-white px-3 py-3 rounded-r-lg hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add Food
          </motion.button>
        </form>
        
        {/* Display meals */}
        <div className="space-y-6">
          {Object.entries(meals).map(([mealType, foodItems]) => (
            <div key={mealType} className="bg-gray-800/60 rounded-xl p-4">
              <h3 className="text-lg font-bold capitalize text-green-400 mb-3">
                {mealType} ({foodItems.reduce((acc, item) => acc + item.calories, 0)} cal)
              </h3>
              {foodItems.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No food items added yet</p>
              ) : (
                <ul className="space-y-2">
                  {foodItems.map(item => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap justify-between items-center bg-gray-700/40 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{item.name}</span>
                        <span className="text-gray-400 text-sm">x{item.quantity || 1}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center mr-2">
                          <button 
                            type="button"
                            onClick={() => updateFoodQuantity(mealType, item.id, (item.quantity || 1) - 1)}
                            className="bg-gray-800 text-white px-2 py-1 rounded-l-md hover:bg-gray-700"
                          >
                            -
                          </button>
                          <span className="bg-gray-800 text-white px-3 py-1">{item.quantity || 1}</span>
                          <button 
                            type="button"
                            onClick={() => updateFoodQuantity(mealType, item.id, (item.quantity || 1) + 1)}
                            className="bg-gray-800 text-white px-2 py-1 rounded-r-md hover:bg-gray-700"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-green-400">{item.calories} cal</span>
                        <button
                          onClick={() => handleRemoveFood(mealType, item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          
          {/* Total calories */}
          <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Total Calories</h3>
              <div className="text-2xl font-bold text-green-400">{totalCalories} cal</div>
            </div>
            
            {/* Progress bar */}
            {formSubmitted && dailyCalorieGoal > 0 && (
              <div className="mt-3">
                <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${totalCalories > dailyCalorieGoal ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((totalCalories / dailyCalorieGoal) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-300">0 cal</span>
                  <span className="text-gray-300">{dailyCalorieGoal} cal (goal)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
          </motion.div>
        </div>
      )}
    </>
  );
}
