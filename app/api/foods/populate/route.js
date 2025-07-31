import { connectDB } from '@/lib/db';
import FoodLibrary from '@/models/FoodLibrary';
import { NextResponse } from 'next/server';
import { batchSearchFoods } from '../gemini-search';

// This route helps populate your database with common foods
// It should be called with admin protection in a real app
export async function GET() {
  try {
    await connectDB();
    
    // List of common foods to add to the database
    const commonFoods = [
      "bread", "white bread", "brown bread", "whole wheat bread", 
      "milk", "whole milk", "skim milk", 
      "rice", "brown rice", "white rice", "basmati rice",
      "chapati", "roti", "naan", "paratha", 
      "dal", "lentils", "beans", "chickpeas",
      "chicken breast", "chicken curry", "butter chicken",
      "paneer", "palak paneer", "paneer tikka",
      "yogurt", "curd", "cheese", "cottage cheese",
      "potato", "tomato", "onion", "cucumber", "carrot", 
      "apple", "banana", "orange", "mango", "grapes"
    ];
    
    // Get foods from database to avoid duplicates
    const existingFoods = await FoodLibrary.find({
      name: { $in: commonFoods.map(f => new RegExp(`^${f}$`, 'i')) }
    }).lean();
    
    const existingNames = existingFoods.map(f => 
      f.name.toLowerCase().trim()
    );
    
    // Filter foods that don't exist in database
    const missingFoods = commonFoods.filter(food => 
      !existingNames.includes(food.toLowerCase().trim())
    );
    
    // If we have missing foods, search them with Gemini
    if (missingFoods.length > 0) {
      // Split into batches of 10 to not overload API
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < missingFoods.length; i += batchSize) {
        batches.push(missingFoods.slice(i, i + batchSize));
      }
      
      // Process each batch
      let addedFoods = [];
      
      for (const batch of batches) {
        const foods = await batchSearchFoods(batch);
        
        if (foods && foods.length > 0) {
          // Save foods to database
          for (const food of foods) {
            try {
              await FoodLibrary.findOneAndUpdate(
                { name: { $regex: new RegExp(`^${food.name}$`, 'i') } },
                {
                  name: food.name,
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fat: food.fat,
                  fiber: food.fiber,
                  category: 'common',
                  tags: [food.name.split(' ')[0], ...batch]
                },
                { upsert: true, new: true }
              );
              
              addedFoods.push(food.name);
            } catch (dbError) {
              console.error(`Error adding ${food.name} to database:`, dbError);
            }
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Added ${addedFoods.length} foods to database`,
        added: addedFoods
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'No new foods to add',
      existingCount: existingFoods.length
    });
  } catch (error) {
    console.error('Database population error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to populate database',
      error: error.message
    }, { status: 500 });
  }
}
