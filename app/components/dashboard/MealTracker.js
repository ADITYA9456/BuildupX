'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Toast from '../Toast';
import FoodSearch from './FoodSearch';

export default function MealTracker({ userId, onMealAdded }) {
  const [mealType, setMealType] = useState('breakfast');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('serving');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [selectedFood, setSelectedFood] = useState(null);
  const [showNutritionForm, setShowNutritionForm] = useState(false);
  
  // For custom food creation/editing
  const [foodForm, setFoodForm] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleFoodSelect = (food) => {
    if (food.isCustom) {
      // Show form to enter nutrition info for custom food
      setFoodForm({
        name: food.name,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      });
      setShowNutritionForm(true);
    } else {
      setSelectedFood(food);
    }
  };

  const handleFoodFormChange = (e) => {
    const { name, value } = e.target;
    setFoodForm(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value) || 0
    }));
  };

  const handleAddCustomFood = () => {
    if (foodForm.name.trim() === '') {
      showToast('Food name cannot be empty', 'error');
      return;
    }
    
    setSelectedFood(foodForm);
    setShowNutritionForm(false);
  };

  const handleAddToMeal = () => {
    if (!selectedFood) return;
    
    // Make sure all nutritional values are valid numbers
    const sanitizedFood = {
      ...selectedFood,
      calories: parseFloat(selectedFood.calories) || 0,
      protein: parseFloat(selectedFood.protein) || 0,
      carbs: parseFloat(selectedFood.carbs) || 0,
      fat: parseFloat(selectedFood.fat) || 0,
      fiber: parseFloat(selectedFood.fiber) || 0
    };
    
    // Log to verify the fiber value is included
    console.log('Adding food with nutrition:', sanitizedFood);
    
    const foodWithQuantity = {
      food: sanitizedFood,
      quantity: parseFloat(quantity) || 1,
      unit
    };
    
    setSelectedFoods(prev => [...prev, foodWithQuantity]);
    setSelectedFood(null);
    setQuantity(1);
    setUnit('serving');
    
    showToast(`Added ${sanitizedFood.name} to your meal`, 'success');
  };

  const handleRemoveFood = (index) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    // Log to verify we're calculating properly
    console.log('Calculating totals for foods:', selectedFoods);
    
    return selectedFoods.reduce((acc, item) => {
      // Make sure quantity is a number and has a valid default
      const quantity = parseFloat(item.quantity) || 1;
      
      // Ensure all nutritional values are numbers
      const calories = (parseFloat(item.food.calories) || 0) * quantity;
      const protein = (parseFloat(item.food.protein) || 0) * quantity;
      const carbs = (parseFloat(item.food.carbs) || 0) * quantity;
      const fat = (parseFloat(item.food.fat) || 0) * quantity;
      const fiber = (parseFloat(item.food.fiber) || 0) * quantity;
      
      // Debug individual item calculation
      console.log(`Food: ${item.food.name}, Quantity: ${quantity}, Calories: ${calories}, Fiber: ${fiber}`);
      
      return {
        calories: acc.calories + calories,
        protein: acc.protein + protein,
        carbs: acc.carbs + carbs,
        fat: acc.fat + fat,
        fiber: acc.fiber + fiber
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const handleSaveMeal = async () => {
    if (selectedFoods.length === 0) {
      showToast('Please add at least one food to your meal', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/meal/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          type: mealType,
          foods: selectedFoods,
          date: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Safely parse JSON response
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e);
        console.error('Response text:', text);
        throw new Error('Invalid JSON response from server');
      }
      
      if (data.success) {
        showToast('Meal added successfully!', 'success');
        setSelectedFoods([]);
        
                  // Call the onMealAdded callback if provided to update parent components
          if (typeof onMealAdded === 'function') {
            // Calculate nutrition totals from this meal for immediate UI update
            const totals = calculateTotals();
            
            // Pass the meal data with nutrition totals to the callback for immediate UI update
            onMealAdded({
              ...data.meal,
              nutritionUpdate: {
                calories: totals.calories,
                protein: totals.protein,
                carbs: totals.carbs,
                fat: totals.fat,
                fiber: totals.fiber
              }
            });
            
            // Also trigger a refresh of nutrition data
            try {
              // Force refresh of nutrition data by making a new request
              fetch('/api/nutrition/data?t=' + new Date().getTime(), { 
                method: 'GET',
                cache: 'no-store',
                headers: { 
                  'x-force-refresh': 'true',
                  'pragma': 'no-cache',
                  'cache-control': 'no-cache'
                } 
              }).then(response => response.json())
                .then(freshData => {
                  // Dispatch a custom event that the Dashboard can listen for
                  const refreshEvent = new CustomEvent('nutrition-data-updated', { 
                    detail: freshData.data 
                  });
                  document.dispatchEvent(refreshEvent);
                })
                .catch(err => console.error('Error in data refresh:', err));
            } catch (refreshError) {
              console.error('Error refreshing nutrition data:', refreshError);
            }
          }
      } else {
        showToast(data.error || 'Failed to add meal', 'error');
      }
    } catch (error) {
      showToast(error.message || 'An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      
      <h2 className="text-xl font-bold text-white mb-4">Track Your Meal</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Meal Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`py-2 px-3 rounded-lg capitalize ${
                mealType === type
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Add Food</label>
        <FoodSearch onFoodSelect={handleFoodSelect} />
      </div>
      
      {/* Nutrition info form for custom foods */}
      {showNutritionForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-700 rounded-lg"
        >
          <h3 className="text-white font-medium mb-3">Enter nutrition info for {foodForm.name}</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Calories (kcal)</label>
              <input
                type="number"
                name="calories"
                value={foodForm.calories}
                onChange={handleFoodFormChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Protein (g)</label>
              <input
                type="number"
                name="protein"
                value={foodForm.protein}
                onChange={handleFoodFormChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Carbs (g)</label>
              <input
                type="number"
                name="carbs"
                value={foodForm.carbs}
                onChange={handleFoodFormChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Fat (g)</label>
              <input
                type="number"
                name="fat"
                value={foodForm.fat}
                onChange={handleFoodFormChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                min="0"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowNutritionForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomFood}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md"
            >
              Add Food
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Selected food options */}
      {selectedFood && !showNutritionForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-700 rounded-lg"
        >
          <h3 className="text-white font-medium mb-2">{selectedFood.name}</h3>
          <div className="text-sm text-gray-300 mb-3">
            {selectedFood.calories} kcal | Protein: {selectedFood.protein}g | Carbs: {selectedFood.carbs}g | Fat: {selectedFood.fat}g
          </div>
          
          <div className="flex items-center space-x-4 mb-3">
            <div className="w-1/3">
              <label className="block text-sm text-gray-300 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                min="0.1"
                step="0.1"
              />
            </div>
            <div className="w-2/3">
              <label className="block text-sm text-gray-300 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
              >
                <option value="serving">Serving</option>
                <option value="g">Grams (g)</option>
                <option value="oz">Ounces (oz)</option>
                <option value="cup">Cup</option>
                <option value="tbsp">Tablespoon</option>
                <option value="tsp">Teaspoon</option>
                <option value="piece">Piece</option>
              </select>
            </div>
          </div>
          
          <div className="text-right">
            <button
              onClick={() => setSelectedFood(null)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToMeal}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-md"
            >
              Add to Meal
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Selected foods list */}
      {selectedFoods.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Your {mealType} foods:</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {selectedFoods.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
              >
                <div>
                  <div className="font-medium text-white">{item.food.name}</div>
                  <div className="text-sm text-gray-400">
                    {(item.food.calories * item.quantity).toFixed(0)} kcal | 
                    {item.quantity} {item.unit}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFood(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Nutritional summary */}
      {selectedFoods.length > 0 && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-3">Nutritional Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-2 bg-gray-600 rounded-lg">
              <div className="text-2xl font-bold text-white">{Math.round(totals.calories)}</div>
              <div className="text-xs text-gray-400">Calories</div>
            </div>
            <div className="text-center p-2 bg-gray-600 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{Math.round(totals.protein)}g</div>
              <div className="text-xs text-gray-400">Protein</div>
            </div>
            <div className="text-center p-2 bg-gray-600 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{Math.round(totals.carbs)}g</div>
              <div className="text-xs text-gray-400">Carbs</div>
            </div>
            <div className="text-center p-2 bg-gray-600 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{Math.round(totals.fat)}g</div>
              <div className="text-xs text-gray-400">Fat</div>
            </div>
            <div className="text-center p-2 bg-gray-600 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{Math.round(totals.fiber)}g</div>
              <div className="text-xs text-gray-400">Fiber</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-right">
        <button
          onClick={handleSaveMeal}
          disabled={selectedFoods.length === 0 || isLoading}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Meal'}
        </button>
      </div>
    </div>
  );
}
