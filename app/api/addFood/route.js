import { connectDB } from '@/lib/mongodb';
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
    
    // Check if we got a fallback response (we'll always get something now)
    const isFallback = nutritionData.food === foodString.trim() || 
                       Object.values(nutritionData).some(val => !val || val === '0 g');
                       
    // Log if this was a fallback response
    if (isFallback) {
      console.warn('⚠️ Using fallback nutrition data for:', foodString);
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

    // Check if this is using fallback data
    const usingFallbackData = nutritionData.food === foodString.trim() && 
                      !nutritionData.food.includes(foodString.trim());
    
    // Return success response with nutrition data
    return NextResponse.json({
      success: true,
      message: usingFallbackData ? 'Food processed with estimated values' : 'Food processed successfully',
      data: {
        _id: savedFood._id.toString(),
        food: nutritionData.food,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        fiber: nutritionData.fiber || '0 g',
        originalInput: foodString
      },
      source: usingFallbackData ? 'fallback-estimation' : 'gemini-ai'
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
// Exported for reuse in scripts
export async function getFoodNutritionFromGemini(foodString) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ Gemini API key not found in environment variables');
      throw new Error('Gemini API key not configured');
    }

    console.log('🤖 Fetching nutrition data from Gemini AI for:', foodString);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.05, // Lower temperature for more deterministic responses
        topK: 16,
        topP: 0.9,
        maxOutputTokens: 1024,
        responseFormat: { type: "json" }, // Request JSON format explicitly
        stopSequences: ["```"] // Prevent markdown code blocks
      },
      systemInstruction: "You are a precise nutritional analysis tool that returns only JSON data. Always provide complete nutritional information with exact values for calories, macronutrients, and fiber. All responses must be in valid JSON format with no additional text or explanations."
    });
    
    const prompt = `
Analyze this food item: "${foodString}"

You MUST respond with ONLY a valid JSON object, no markdown formatting, no additional text:

{
  "food": "standardized food name",
  "calories": "X kcal",
  "protein": "X g",
  "carbs": "X g", 
  "fat": "X g",
  "fiber": "X g"
}

- All fields are required
- Always include units (kcal for calories, g for others)
- If a specific quantity is mentioned (e.g., "2 apples"), calculate the total nutrition
- Be precise with numbers (round to 1 decimal place)
- If exact values are uncertain, provide reasonable estimates based on standard portions
- Format numbers consistently (e.g., "120.5 kcal" not "about 120 calories")
- Never leave any field empty or null
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
    
    // Extract JSON object - more robust approach
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('❌ No valid JSON found in response');
      // Instead of returning null, create a fallback response with the original food string
      return createFallbackNutritionData(foodString);
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
      
      // Try more aggressive cleaning if regular parsing fails
      try {
        // Replace common issues in malformed JSON from AI responses
        let repairAttempt = cleanText
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
          .replace(/,\s*}/g, '}'); // Remove trailing commas
          
        nutritionData = JSON.parse(repairAttempt);
        console.log('✅ JSON repaired successfully:', nutritionData);
      } catch (secondError) {
        console.error('❌ JSON repair also failed:', secondError.message);
        return createFallbackNutritionData(foodString);
      }
    }

    // Validate and sanitize all fields
    const requiredFields = ['food', 'calories', 'protein', 'carbs', 'fat'];
    
    // Sanitize field values and create a clean object
    let cleanData = {
      food: nutritionData.food || foodString,
      calories: sanitizeNutritionValue(nutritionData.calories, 'kcal'),
      protein: sanitizeNutritionValue(nutritionData.protein, 'g'),
      carbs: sanitizeNutritionValue(nutritionData.carbs, 'g'),
      fat: sanitizeNutritionValue(nutritionData.fat, 'g'),
      fiber: sanitizeNutritionValue(nutritionData.fiber || '0 g', 'g')
    };
    
    // Check if we have valid numeric values in the required fields
    const invalidFields = requiredFields.filter(field => {
      if (field === 'food') return false; // Skip food name validation
      const numValue = parseFloat(cleanData[field].replace(/[^\d.]/g, ''));
      return isNaN(numValue) || numValue < 0;
    });
    
    if (invalidFields.length > 0) {
      console.error('❌ Invalid nutrition values for fields:', invalidFields);
      console.error('❌ Received data:', nutritionData);
      console.error('❌ Cleaned data:', cleanData);
      // Don't throw error, use fallback with estimation
      return estimateNutritionData(foodString, cleanData);
    }

    console.log('✅ Successfully parsed nutrition data:', cleanData);
    return cleanData;

  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    return createFallbackNutritionData(foodString);
  }
}

// Helper function to create fallback nutrition data when AI fails
function createFallbackNutritionData(foodString) {
  console.log('⚠️ Creating fallback nutrition data for:', foodString);
  
  // Basic estimation based on food category detection
  const lowCalorieFoods = ['lettuce', 'spinach', 'greens', 'cucumber', 'celery', 'broccoli'];
  const mediumCalorieFoods = ['apple', 'orange', 'banana', 'fruit', 'vegetable', 'yogurt', 'milk', 'egg'];
  const highCalorieFoods = ['meat', 'cheese', 'nut', 'butter', 'oil', 'cake', 'chocolate', 'pizza', 'burger'];
  
  let calories = '100 kcal', protein = '5 g', carbs = '10 g', fat = '2 g', fiber = '1 g';
  
  // Simple keyword matching for estimation
  const lowerFood = foodString.toLowerCase();
  
  if (lowCalorieFoods.some(item => lowerFood.includes(item))) {
    calories = '30 kcal'; protein = '2 g'; carbs = '5 g'; fat = '0.5 g'; fiber = '2 g';
  } else if (highCalorieFoods.some(item => lowerFood.includes(item))) {
    calories = '250 kcal'; protein = '15 g'; carbs = '15 g'; fat = '15 g'; fiber = '1 g';
  }
  
  return {
    food: foodString.trim(),
    calories,
    protein,
    carbs,
    fat,
    fiber
  };
}

// Helper function to sanitize nutrition values and ensure proper formatting
function sanitizeNutritionValue(value, unit) {
  if (!value || typeof value !== 'string') {
    return unit === 'kcal' ? '100 kcal' : '0 g';
  }
  
  // Extract numeric part
  const numMatch = value.match(/[\d.]+/);
  if (!numMatch) {
    return unit === 'kcal' ? '100 kcal' : '0 g';
  }
  
  const num = parseFloat(numMatch[0]);
  if (isNaN(num) || num < 0) {
    return unit === 'kcal' ? '100 kcal' : '0 g';
  }
  
  // Format to 1 decimal place if needed
  const formattedNum = Number.isInteger(num) ? num.toString() : num.toFixed(1);
  
  // Always include the proper unit
  if (value.includes(unit)) {
    // Replace the numeric part while keeping the unit
    return value.replace(/[\d.]+/, formattedNum);
  } else {
    return `${formattedNum} ${unit}`;
  }
}

// Helper function to estimate nutrition data when some values are valid but others aren't
function estimateNutritionData(foodString, partialData) {
  console.log('⚠️ Estimating missing nutrition values for:', foodString);
  
  // Start with the fallback data
  const fallback = createFallbackNutritionData(foodString);
  
  // Override with any valid values from the partial data
  return {
    food: partialData.food || fallback.food,
    calories: isValidNutritionValue(partialData.calories) ? partialData.calories : fallback.calories,
    protein: isValidNutritionValue(partialData.protein) ? partialData.protein : fallback.protein,
    carbs: isValidNutritionValue(partialData.carbs) ? partialData.carbs : fallback.carbs,
    fat: isValidNutritionValue(partialData.fat) ? partialData.fat : fallback.fat,
    fiber: isValidNutritionValue(partialData.fiber) ? partialData.fiber : fallback.fiber
  };
}

// Helper function to check if a nutrition value is valid
function isValidNutritionValue(value) {
  if (!value || typeof value !== 'string') return false;
  const numValue = parseFloat(value.replace(/[^\d.]/g, ''));
  return !isNaN(numValue) && numValue >= 0;
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
