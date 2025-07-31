import { connectDB } from '@/lib/db';
import FoodLibrary from '@/models/FoodLibrary';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI - Vercel serverless compatible
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Main API handler for adding food with Gemini AI
export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { foodString } = body;

    if (!foodString || typeof foodString !== 'string' || foodString.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Food string is required and must be at least 2 characters'
      }, { status: 400 });
    }

    console.log('🍎 Processing food item:', foodString);

    // Get nutrition data from Gemini AI
    const nutritionData = await getFoodNutritionFromGemini(foodString.trim());
    
    if (!nutritionData) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch nutrition data for this food item. The AI service may be temporarily unavailable.',
        fallback: true
      }, { status: 202 }); // 202 Accepted but with fallback needed
    }

    // Connect to MongoDB and save the data
    await connectDB();
    
    // Check if this food already exists in our database
    const existingFood = await FoodLibrary.findOne({ 
      name: { $regex: nutritionData.food, $options: 'i' } 
    });

    let savedFood;
    
    if (existingFood) {
      console.log('📚 Food already exists in database:', existingFood.name);
      savedFood = existingFood;
    } else {
      // Create new food entry
      const newFood = new FoodLibrary({
        name: nutritionData.food,
        calories: parseFloat(nutritionData.calories.replace(/[^\d.]/g, '')) || 0,
        protein: parseFloat(nutritionData.protein.replace(/[^\d.]/g, '')) || 0,
        carbs: parseFloat(nutritionData.carbs.replace(/[^\d.]/g, '')) || 0,
        fat: parseFloat(nutritionData.fat.replace(/[^\d.]/g, '')) || 0,
        fiber: parseFloat(nutritionData.fiber?.replace(/[^\d.]/g, '') || '0') || 0,
        category: 'ai-generated',
        tags: [nutritionData.food.toLowerCase(), foodString.toLowerCase()],
        source: 'gemini-ai',
        createdAt: new Date()
      });

      savedFood = await newFood.save();
      console.log('✅ Saved new food to database:', savedFood.name);
    }

    // Return success response with nutrition data
    return NextResponse.json({
      success: true,
      message: 'Food processed successfully',
      data: {
        _id: savedFood._id.toString(),
        food: nutritionData.food,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        fiber: nutritionData.fiber || '0 g',
        originalInput: foodString
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Add food API error:', error.message);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Internal server error while processing food item';
    let statusCode = 500;
    
    if (error.message.includes('Gemini API key')) {
      errorMessage = 'AI service configuration error';
      statusCode = 503;
    } else if (error.message.includes('parse') || error.message.includes('JSON')) {
      errorMessage = 'AI service returned invalid data';
      statusCode = 502;
    } else if (error.message.includes('Missing required')) {
      errorMessage = 'AI service returned incomplete nutrition data';
      statusCode = 502;
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      fallback: true,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: statusCode });
  }
}

// Function to get nutrition data from Gemini AI - Optimized for Vercel
async function getFoodNutritionFromGemini(foodString) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ Gemini API key not found in environment variables');
      throw new Error('Gemini API key not configured');
    }

    console.log('🤖 Fetching nutrition data from Gemini AI for:', foodString);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });
    
    const prompt = `
Analyze: "${foodString}"

Return ONLY valid JSON, no other text:

{
  "food": "food name",
  "calories": "X kcal",
  "protein": "X g",
  "carbs": "X g",
  "fat": "X g",
  "fiber": "X g"
}

Include units. If quantity mentioned, calculate total nutrition.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log('🤖 Gemini raw response:', text);

    // Clean and parse the JSON response
    let cleanText = text;
    
    // Remove any markdown code blocks
    cleanText = cleanText.replace(/```json\s*/gi, '');
    cleanText = cleanText.replace(/```\s*/gi, '');
    
    // Extract JSON object
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('❌ No valid JSON found in response');
      return null;
    }
    
    cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
    console.log('🧹 Cleaned JSON for parsing:', cleanText);

    let nutritionData;
    try {
      nutritionData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError.message);
      console.error('❌ Raw Gemini response:', text);
      console.error('❌ Cleaned text attempted to parse:', cleanText);
      throw new Error('Failed to parse Gemini AI response as JSON');
    }

    // Validate required fields
    const requiredFields = ['food', 'calories', 'protein', 'carbs', 'fat'];
    const missingFields = requiredFields.filter(field => !nutritionData[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      console.error('❌ Received data:', nutritionData);
      throw new Error(`Missing required nutrition fields: ${missingFields.join(', ')}`);
    }

    // Add fiber if missing
    if (!nutritionData.fiber) {
      nutritionData.fiber = '0 g';
    }

    console.log('✅ Successfully parsed nutrition data:', nutritionData);
    return nutritionData;

  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    return null;
  }
}

// Optional: GET method for health check and testing
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testFood = searchParams.get('test');
  
  if (testFood) {
    // Test the Gemini API with a simple food item
    try {
      const result = await getFoodNutritionFromGemini(testFood);
      return NextResponse.json({
        message: 'Test completed',
        input: testFood,
        result: result,
        apiKeyAvailable: !!process.env.GEMINI_API_KEY
      });
    } catch (error) {
      return NextResponse.json({
        message: 'Test failed',
        input: testFood,
        error: error.message,
        apiKeyAvailable: !!process.env.GEMINI_API_KEY
      });
    }
  }
  
  return NextResponse.json({
    message: 'Add Food API is running',
    endpoint: 'POST /api/addFood',
    testEndpoint: 'GET /api/addFood?test=apple',
    status: 'healthy',
    apiKeyAvailable: !!process.env.GEMINI_API_KEY
  });
}
