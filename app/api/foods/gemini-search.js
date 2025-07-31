/**
 * Helper function to use Gemini API for nutrition data
 */

export async function searchFoodWithGemini(query) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCxR_wjblQC1xMsREkuEbW9dQBApj3ykS4';
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // Special handling for bread and common foods that might not work well
    const commonFoodOverrides = {
      "bread": {
        name: "Bread (White)",
        calories: 265,
        protein: 9,
        carbs: 49,
        fat: 3.2,
        fiber: 2.7
      },
      "brown bread": {
        name: "Bread (Brown/Whole Wheat)",
        calories: 247,
        protein: 13,
        carbs: 41,
        fat: 3.4,
        fiber: 7
      },
      "milk": {
        name: "Milk (Whole)",
        calories: 61,
        protein: 3.2,
        carbs: 4.8,
        fat: 3.3,
        fiber: 0
      }
    };
    
    // Check if we have a pre-defined override for this query
    const lowerQuery = query.toLowerCase().trim();
    if (commonFoodOverrides[lowerQuery]) {
      const override = commonFoodOverrides[lowerQuery];
      return {
        _id: `gemini-${Date.now()}`,
        name: override.name,
        calories: override.calories,
        protein: override.protein,
        carbs: override.carbs,
        fat: override.fat,
        fiber: override.fiber,
        category: 'common-food',
        source: 'gemini-override'
      };
    }
    
    // Construct prompt for Gemini to get nutritional information
    const prompt = `Provide nutritional information for "${query}" as a food item. Return the result as a JSON object with these exact keys only: name, calories, protein, carbs, fat, fiber. 
    For calories, provide value in kcal per 100g serving. For protein, carbs, fat, and fiber, provide values in grams per 100g serving.
    Make sure values are numbers (not strings) and don't include units in the values.
    For example, for "apple" return: {"name": "Apple", "calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, "fiber": 2.4}
    If there are multiple variations, provide data for the most common variety.
    If the query is not a food item, return null for all values except name.`;
    
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 1000
        }
      })
    });

    const data = await response.json();
    
    // Check if we got a valid response
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0] && 
        data.candidates[0].content.parts[0].text) {
      
      // Extract the JSON from the response text
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Try to extract JSON object from the response text
      const jsonMatch = responseText.match(/\{[^]*\}/);
      
      if (jsonMatch) {
        try {
          const foodData = JSON.parse(jsonMatch[0]);
          
          // Validate that we got the required fields
          if (foodData && foodData.name) {
            return {
              _id: `gemini-${Date.now()}`,
              name: foodData.name,
              calories: Math.round(Number(foodData.calories)) || 0,
              protein: Number(foodData.protein) || 0,
              carbs: Number(foodData.carbs) || 0,
              fat: Number(foodData.fat) || 0,
              fiber: Number(foodData.fiber) || 0,
              category: 'gemini-generated',
              source: 'gemini'
            };
          }
        } catch (jsonError) {
          console.error('Error parsing Gemini response JSON:', jsonError);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

/**
 * Search for multiple foods at once using Gemini
 * This can be used to populate common foods database
 */
export async function batchSearchFoods(queries) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCxR_wjblQC1xMsREkuEbW9dQBApj3ykS4';
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // Combine all queries into one prompt to save API calls
    const foodList = queries.join('", "');
    const prompt = `Provide nutritional information for the following food items: "${foodList}".
    
    Return the results as a JSON array where each object has these exact keys: name, calories, protein, carbs, fat, fiber.
    For calories, provide value in kcal per 100g serving. For protein, carbs, fat, and fiber, provide values in grams per 100g serving.
    Make sure values are numbers (not strings) and don't include units in the values.
    
    Format your response as a valid JSON array like this:
    [
      {"name": "Food1", "calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, "fiber": 2.4},
      {"name": "Food2", "calories": 150, "protein": 5, "carbs": 30, "fat": 0.5, "fiber": 1.2}
    ]
    
    Include all ${queries.length} foods in your response.`;
    
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 2000
        }
      })
    });

    const data = await response.json();
    
    // Check if we got a valid response
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0] && 
        data.candidates[0].content.parts[0].text) {
      
      // Extract the JSON from the response text
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Try to extract JSON array from the response text
      const jsonMatch = responseText.match(/\[\s*\{[^]*\}\s*\]/);
      
      if (jsonMatch) {
        try {
          const foodsData = JSON.parse(jsonMatch[0]);
          
          // Transform to our format
          return foodsData.map(food => ({
            _id: `gemini-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: food.name,
            calories: Math.round(Number(food.calories)) || 0,
            protein: Number(food.protein) || 0,
            carbs: Number(food.carbs) || 0,
            fat: Number(food.fat) || 0,
            fiber: Number(food.fiber) || 0,
            category: 'gemini-generated',
            source: 'gemini-batch'
          }));
        } catch (jsonError) {
          console.error('Error parsing Gemini batch response JSON:', jsonError);
        }
      }
    }
    
    return [];
  } catch (error) {
    console.error('Gemini batch API error:', error);
    return [];
  }
}
