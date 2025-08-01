// Script to add rice varieties to the database

import { connectDB } from '@/lib/mongodb';
import FoodLibrary from '@/models/FoodLibrary';
import { getFoodNutritionFromGemini } from '../app/api/addFood/route.js';

// List of rice varieties to add
const riceVarieties = [
  "white rice, cooked, 1 cup",
  "brown rice, cooked, 1 cup",
  "basmati rice, cooked, 1 cup",
  "jasmine rice, cooked, 1 cup",
  "white rice, raw, 100g",
  "brown rice, raw, 100g",
  "rice flour, 100g",
  "rice bran, 1 tablespoon",
  "wild rice, cooked, 1 cup",
  "rice noodles, cooked, 1 cup",
  "idli rice, raw, 100g",
  "red rice, cooked, 1 cup",
  "black rice, cooked, 1 cup",
  "rice porridge, 1 cup",
  "rice krispies cereal, 1 cup"
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
      category: 'rice',
      tags: [nutritionData.food.toLowerCase(), 'rice', 'grain'],
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

// Main function to process all rice varieties
async function addRiceVarieties() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');
    
    console.log('🍚 Starting to add rice varieties to database...');
    
    const results = [];
    
    // Process foods one by one to avoid rate limiting
    for (const rice of riceVarieties) {
      const result = await addFoodToDatabase(rice);
      results.push({ food: rice, success: !!result });
      
      // Add a small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n===== SUMMARY =====');
    console.log(`Total rice varieties processed: ${results.length}`);
    console.log(`Successfully added: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Script error:', error.message);
    process.exit(1);
  }
}

// Execute the script
addRiceVarieties();
