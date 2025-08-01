// Script to add common foods to the database using the Gemini API

import { connectDB } from '@/lib/mongodb';
import FoodLibrary from '@/models/FoodLibrary';
import { getFoodNutritionFromGemini } from '../app/api/addFood/route.js';

// List of common foods to add
const commonFoods = [
  "white rice, cooked, 1 cup",
  "brown rice, cooked, 1 cup",
  "basmati rice, cooked, 1 cup",
  "jasmine rice, cooked, 1 cup",
  "bread, white, 1 slice",
  "bread, whole wheat, 1 slice",
  "roti, plain, 1 piece",
  "chapati, 1 piece",
  "naan, plain, 1 piece",
  "pasta, cooked, 1 cup",
  "dal, cooked, 1 cup",
  "chicken curry, 1 cup",
  "paneer curry, 1 cup",
  "samosa, 1 piece",
  "dosa, plain, 1 piece",
  "idli, 2 pieces",
  "milk, 1 cup",
  "yogurt, 1 cup",
  "chicken breast, cooked, 100g",
  "egg, boiled, 1 large"
];

// Function to add a food item to database
async function addFoodToDatabase(foodString) {
  try {
    console.log(`Processing: ${foodString}`);
    
    // Get nutrition data from Gemini AI
    const nutritionData = await getFoodNutritionFromGemini(foodString);
    
    if (!nutritionData) {
      console.log(`❌ Failed to get nutrition data for: ${foodString}`);
      return null;
    }
    
    // Check if this food already exists in our database
    const existingFood = await FoodLibrary.findOne({ 
      name: { $regex: nutritionData.food, $options: 'i' } 
    });

    if (existingFood) {
      console.log(`📚 Food already exists in database: ${existingFood.name}`);
      return existingFood;
    }
    
    // Create new food entry
    const newFood = new FoodLibrary({
      name: nutritionData.food,
      calories: parseFloat(nutritionData.calories.replace(/[^\d.]/g, '')) || 0,
      protein: parseFloat(nutritionData.protein.replace(/[^\d.]/g, '')) || 0,
      carbs: parseFloat(nutritionData.carbs.replace(/[^\d.]/g, '')) || 0,
      fat: parseFloat(nutritionData.fat.replace(/[^\d.]/g, '')) || 0,
      fiber: parseFloat(nutritionData.fiber?.replace(/[^\d.]/g, '') || '0') || 0,
      category: 'common',
      tags: [nutritionData.food.toLowerCase(), foodString.toLowerCase(), 'common'],
      source: 'gemini-ai',
      createdAt: new Date()
    });

    const savedFood = await newFood.save();
    console.log(`✅ Added to database: ${savedFood.name}`);
    return savedFood;
  } catch (error) {
    console.error(`❌ Error adding ${foodString}:`, error.message);
    return null;
  }
}

// Main function to process all common foods
async function addCommonFoods() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');
    
    console.log('🍽️ Starting to add common foods to database...');
    
    const results = [];
    
    // Process foods one by one to avoid rate limiting
    for (const food of commonFoods) {
      const result = await addFoodToDatabase(food);
      results.push({ food, success: !!result });
      
      // Add a small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n===== SUMMARY =====');
    console.log(`Total foods processed: ${results.length}`);
    console.log(`Successfully added: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Script error:', error.message);
    process.exit(1);
  }
}

// Execute the script
addCommonFoods();
