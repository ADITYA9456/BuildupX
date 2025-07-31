import { connectDB } from '@/lib/mongodb';
import FoodLibrary from '@/models/FoodLibrary';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to search food data using Gemini AI
async function searchFoodWithGemini(query) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ Gemini API key not found');
      return null;
    }

    console.log('🤖 Searching with Gemini AI for:', query);
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      You are a nutrition expert. Provide accurate nutrition data for: "${query}"
      
      Return ONLY a valid JSON object in this exact format (no extra text, no markdown):
      {
        "found": true,
        "name": "Apple",
        "calories": 52,
        "protein": 0.3,
        "carbs": 14,
        "fat": 0.2,
        "fiber": 2.4
      }
      
      All values should be per 100 grams. If the food doesn't exist, return:
      {"found": false}
      
      Food to analyze: ${query}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 Gemini raw response:', text);

    // Parse the JSON response
    let nutritionData;
    try {
      // Clean the response text thoroughly
      let cleanText = text.trim();
      
      // Remove markdown code blocks
      cleanText = cleanText.replace(/```json\s?/gi, '');
      cleanText = cleanText.replace(/```\s?/gi, '');
      
      // Remove any extra text before/after JSON
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart >= 0 && jsonEnd >= 0) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('🧹 Cleaned text for parsing:', cleanText);
      nutritionData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError, 'Raw text:', text);
      return null;
    }

    if (!nutritionData.found) {
      console.log('❌ Food not found by AI:', query);
      return null;
    }

    // Validate and format nutrition data
    const validatedFood = {
      _id: `gemini-${Date.now()}`,
      name: nutritionData.name || query,
      calories: Math.max(0, Number(nutritionData.calories) || 0),
      protein: Math.max(0, Number(nutritionData.protein) || 0),
      carbs: Math.max(0, Number(nutritionData.carbs) || 0),
      fat: Math.max(0, Number(nutritionData.fat) || 0),
      fiber: Math.max(0, Number(nutritionData.fiber) || 0),
      source: 'gemini-ai'
    };

    console.log('✅ AI nutrition data:', validatedFood);
    return validatedFood;

  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    // Get the search query from URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        message: 'Search query must be at least 2 characters'
      }, { status: 400 });
    }

    console.log('🔍 Food search for:', query);

    // First try to search our own database for cached results
    try {
      await connectDB();
      const dbFoods = await FoodLibrary.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      }).limit(5);
      
      if (dbFoods && dbFoods.length > 0) {
        console.log('✅ Found in local database:', dbFoods.length, 'foods');
        const formattedFoods = dbFoods.map(food => ({
          _id: food._id.toString(),
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          source: 'database'
        }));
        
        return NextResponse.json({ 
          success: true,
          foods: formattedFoods
        });
      }
    } catch (dbError) {
      console.error('Database search error:', dbError);
      // Continue to AI search even if DB fails
    }
    
    // Use Gemini AI to get fresh nutrition data
    console.log('🔍 Searching with Gemini AI...');
    const geminiFood = await searchFoodWithGemini(query);
    
    if (geminiFood) {
      // Save Gemini result to database for future use
      try {
        const foodLibraryItem = new FoodLibrary({
          name: geminiFood.name,
          calories: geminiFood.calories,
          protein: geminiFood.protein,
          carbs: geminiFood.carbs,
          fat: geminiFood.fat,
          fiber: geminiFood.fiber,
          category: 'ai-generated',
          tags: [query.toLowerCase(), geminiFood.name.toLowerCase()]
        });
        await foodLibraryItem.save();
        console.log('✅ Saved Gemini result to database');
      } catch (saveError) {
        console.error('⚠️ Could not save to database:', saveError.message);
      }
      
      return NextResponse.json({
        success: true,
        foods: [geminiFood]
      });
    }
    
    // If Gemini AI fails, return empty array
    console.log('❌ No food data found for:', query);
    return NextResponse.json({
      success: true,
      foods: []
    });

  } catch (error) {
    console.error('❌ Food search error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to search for food' 
    }, { status: 500 });
  }
}
