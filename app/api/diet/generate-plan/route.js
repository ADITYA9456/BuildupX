import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper function to authenticate user
async function authenticateUser() {
  // Get the token from cookies
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  // Check if token exists
  if (!token) {
    return { error: 'Not authenticated', userId: null };
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { error: null, userId: decoded.id };
  } catch (error) {
    return { error: 'Invalid token', userId: null };
  }
}

export async function POST(request) {
  try {
    // Authenticate user
    const { error, userId } = await authenticateUser();
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const requestData = await request.json();
    const {
      height,
      weight,
      age,
      gender,
      goal,
      activityLevel,
      duration,
      preferences,
      dailyTargets
    } = requestData;

    // Generate diet plan based on user profile
    const dietPlan = generateDietPlan(
      height,
      weight,
      age,
      gender,
      goal,
      activityLevel,
      duration,
      preferences,
      dailyTargets
    );

    return NextResponse.json({
      success: true,
      dietPlan
    });
  } catch (error) {
    console.error('Error generating diet plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate diet plan' },
      { status: 500 }
    );
  }
}

function generateDietPlan(
  height,
  weight,
  age,
  gender,
  goal,
  activityLevel,
  duration,
  preferences,
  dailyTargets
) {
  // Use the daily targets if available, otherwise calculate based on profile
  const targetCalories = dailyTargets?.calories || 2000;
  const targetProtein = dailyTargets?.protein || 120;
  const targetCarbs = dailyTargets?.carbs || 200;
  const targetFat = dailyTargets?.fat || 65;

  // Diet plan for a single day
  if (duration === 'day') {
    const breakfast = generateMeal('breakfast', preferences, {
      calories: targetCalories * 0.25,
      protein: targetProtein * 0.25,
      carbs: targetCarbs * 0.3,
      fat: targetFat * 0.2,
    });

    const lunch = generateMeal('lunch', preferences, {
      calories: targetCalories * 0.35,
      protein: targetProtein * 0.35,
      carbs: targetCarbs * 0.35,
      fat: targetFat * 0.35,
    });

    const dinner = generateMeal('dinner', preferences, {
      calories: targetCalories * 0.3,
      protein: targetProtein * 0.3,
      carbs: targetCarbs * 0.25,
      fat: targetFat * 0.35,
    });

    const snacks = generateMeal('snacks', preferences, {
      calories: targetCalories * 0.1,
      protein: targetProtein * 0.1,
      carbs: targetCarbs * 0.1,
      fat: targetFat * 0.1,
    });

    const dailySummary = {
      calories: Math.round(breakfast.nutrition.calories + lunch.nutrition.calories + dinner.nutrition.calories + snacks.nutrition.calories),
      protein: Math.round(breakfast.nutrition.protein + lunch.nutrition.protein + dinner.nutrition.protein + snacks.nutrition.protein),
      carbs: Math.round(breakfast.nutrition.carbs + lunch.nutrition.carbs + dinner.nutrition.carbs + snacks.nutrition.carbs),
      fat: Math.round(breakfast.nutrition.fat + lunch.nutrition.fat + dinner.nutrition.fat + snacks.nutrition.fat),
    };

    return {
      meals: [breakfast, lunch, dinner, snacks],
      dailySummary
    };
  } 
  // Diet plan for a full week
  else {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const weekPlan = days.map(day => {
      const breakfast = generateMeal('breakfast', preferences, {
        calories: targetCalories * 0.25,
        protein: targetProtein * 0.25,
        carbs: targetCarbs * 0.3,
        fat: targetFat * 0.2,
      });
  
      const lunch = generateMeal('lunch', preferences, {
        calories: targetCalories * 0.35,
        protein: targetProtein * 0.35,
        carbs: targetCarbs * 0.35,
        fat: targetFat * 0.35,
      });
  
      const dinner = generateMeal('dinner', preferences, {
        calories: targetCalories * 0.3,
        protein: targetProtein * 0.3,
        carbs: targetCarbs * 0.25,
        fat: targetFat * 0.35,
      });
  
      const snacks = generateMeal('snacks', preferences, {
        calories: targetCalories * 0.1,
        protein: targetProtein * 0.1,
        carbs: targetCarbs * 0.1,
        fat: targetFat * 0.1,
      });

      return {
        day,
        meals: [breakfast, lunch, dinner, snacks]
      };
    });

    return { weekPlan };
  }
}

function generateMeal(type, preferences, targets) {
  const meals = {
    breakfast: {
      vegetarian: [
        {
          items: [
            { name: 'Greek Yogurt', portion: '1 cup (200g)' },
            { name: 'Mixed Berries', portion: '1 cup (150g)' },
            { name: 'Honey', portion: '1 tbsp (20g)' },
            { name: 'Almonds', portion: '1/4 cup (30g)' }
          ],
          nutrition: { calories: 420, protein: 24, carbs: 45, fat: 19 }
        },
        {
          items: [
            { name: 'Oatmeal', portion: '1 cup cooked (240g)' },
            { name: 'Banana', portion: '1 medium (120g)' },
            { name: 'Peanut Butter', portion: '2 tbsp (30g)' },
            { name: 'Chia Seeds', portion: '1 tbsp (15g)' }
          ],
          nutrition: { calories: 450, protein: 18, carbs: 65, fat: 16 }
        },
        {
          items: [
            { name: 'Whole Grain Toast', portion: '2 slices' },
            { name: 'Avocado', portion: '1/2 medium (100g)' },
            { name: 'Eggs', portion: '2 large, scrambled' },
            { name: 'Cherry Tomatoes', portion: '1/2 cup (75g)' }
          ],
          nutrition: { calories: 480, protein: 22, carbs: 40, fat: 26 }
        }
      ],
      vegan: [
        {
          items: [
            { name: 'Overnight Oats with Soy Milk', portion: '1 cup (240g)' },
            { name: 'Mixed Berries', portion: '1 cup (150g)' },
            { name: 'Flaxseeds', portion: '2 tbsp (20g)' },
            { name: 'Maple Syrup', portion: '1 tbsp (20g)' }
          ],
          nutrition: { calories: 410, protein: 16, carbs: 65, fat: 12 }
        },
        {
          items: [
            { name: 'Tofu Scramble', portion: '150g' },
            { name: 'Spinach', portion: '1 cup (30g)' },
            { name: 'Whole Grain Toast', portion: '2 slices' },
            { name: 'Nutritional Yeast', portion: '1 tbsp (5g)' }
          ],
          nutrition: { calories: 380, protein: 22, carbs: 40, fat: 14 }
        }
      ],
      keto: [
        {
          items: [
            { name: 'Eggs', portion: '3 large' },
            { name: 'Avocado', portion: '1/2 medium (100g)' },
            { name: 'Bacon', portion: '3 slices (30g)' },
            { name: 'Spinach', portion: '1 cup sautéed (30g)' }
          ],
          nutrition: { calories: 550, protein: 28, carbs: 9, fat: 45 }
        }
      ],
      high_protein: [
        {
          items: [
            { name: 'Protein Shake', portion: '1 scoop with water (30g)' },
            { name: 'Eggs', portion: '4 large, scrambled' },
            { name: 'Whole Grain Toast', portion: '1 slice' },
            { name: 'Low-fat Cheese', portion: '30g' }
          ],
          nutrition: { calories: 490, protein: 50, carbs: 20, fat: 22 }
        }
      ],
      no_preferences: [
        {
          items: [
            { name: 'Eggs', portion: '2 large, scrambled' },
            { name: 'Whole Grain Toast', portion: '2 slices' },
            { name: 'Avocado', portion: '1/4 medium (50g)' },
            { name: 'Fruit', portion: '1 medium apple or banana' }
          ],
          nutrition: { calories: 450, protein: 20, carbs: 50, fat: 18 }
        },
        {
          items: [
            { name: 'Greek Yogurt', portion: '1 cup (200g)' },
            { name: 'Granola', portion: '1/3 cup (40g)' },
            { name: 'Mixed Berries', portion: '1 cup (150g)' },
            { name: 'Honey', portion: '1 tbsp (20g)' }
          ],
          nutrition: { calories: 400, protein: 22, carbs: 55, fat: 10 }
        }
      ]
    },
    lunch: {
      vegetarian: [
        {
          items: [
            { name: 'Quinoa Bowl', portion: '1 cup cooked (180g)' },
            { name: 'Mixed Vegetables', portion: '1.5 cups (150g)' },
            { name: 'Feta Cheese', portion: '30g' },
            { name: 'Olive Oil Dressing', portion: '1 tbsp (15ml)' }
          ],
          nutrition: { calories: 520, protein: 18, carbs: 65, fat: 22 }
        }
      ],
      vegan: [
        {
          items: [
            { name: 'Lentil Soup', portion: '1.5 cups (350ml)' },
            { name: 'Mixed Green Salad', portion: '2 cups (100g)' },
            { name: 'Whole Grain Bread', portion: '1 slice' },
            { name: 'Balsamic Vinaigrette', portion: '1 tbsp (15ml)' }
          ],
          nutrition: { calories: 480, protein: 20, carbs: 70, fat: 14 }
        }
      ],
      keto: [
        {
          items: [
            { name: 'Grilled Chicken Salad', portion: '150g chicken' },
            { name: 'Mixed Greens', portion: '2 cups (100g)' },
            { name: 'Avocado', portion: '1/2 medium (100g)' },
            { name: 'Olive Oil & Vinegar Dressing', portion: '2 tbsp (30ml)' }
          ],
          nutrition: { calories: 550, protein: 40, carbs: 10, fat: 38 }
        }
      ],
      high_protein: [
        {
          items: [
            { name: 'Grilled Chicken Breast', portion: '200g' },
            { name: 'Brown Rice', portion: '1/2 cup cooked (100g)' },
            { name: 'Steamed Broccoli', portion: '1 cup (100g)' },
            { name: 'Olive Oil', portion: '1 tbsp (15ml)' }
          ],
          nutrition: { calories: 580, protein: 60, carbs: 40, fat: 18 }
        }
      ],
      no_preferences: [
        {
          items: [
            { name: 'Grilled Chicken Sandwich', portion: '1 sandwich' },
            { name: 'Whole Grain Bread', portion: '2 slices' },
            { name: 'Mixed Green Salad', portion: '1 cup (50g)' },
            { name: 'Olive Oil Dressing', portion: '1 tbsp (15ml)' }
          ],
          nutrition: { calories: 550, protein: 35, carbs: 50, fat: 22 }
        },
        {
          items: [
            { name: 'Turkey & Cheese Wrap', portion: '1 large wrap' },
            { name: 'Whole Wheat Tortilla', portion: '1 large (60g)' },
            { name: 'Turkey Breast', portion: '100g' },
            { name: 'Cheese', portion: '30g' },
            { name: 'Mixed Vegetables', portion: '1/2 cup (50g)' }
          ],
          nutrition: { calories: 520, protein: 40, carbs: 45, fat: 20 }
        }
      ]
    },
    dinner: {
      vegetarian: [
        {
          items: [
            { name: 'Vegetable Stir Fry', portion: '1.5 cups (300g)' },
            { name: 'Tofu', portion: '150g' },
            { name: 'Brown Rice', portion: '1 cup cooked (200g)' },
            { name: 'Soy Sauce', portion: '1 tbsp (15ml)' }
          ],
          nutrition: { calories: 550, protein: 25, carbs: 75, fat: 15 }
        }
      ],
      vegan: [
        {
          items: [
            { name: 'Chickpea Curry', portion: '1.5 cups (350g)' },
            { name: 'Brown Rice', portion: '1 cup cooked (200g)' },
            { name: 'Steamed Vegetables', portion: '1 cup (100g)' },
            { name: 'Coconut Milk', portion: '1/4 cup (60ml)' }
          ],
          nutrition: { calories: 600, protein: 20, carbs: 90, fat: 18 }
        }
      ],
      keto: [
        {
          items: [
            { name: 'Grilled Salmon', portion: '150g' },
            { name: 'Asparagus', portion: '1 cup (100g)' },
            { name: 'Cauliflower Mash', portion: '1 cup (200g)' },
            { name: 'Butter', portion: '1 tbsp (15g)' }
          ],
          nutrition: { calories: 520, protein: 40, carbs: 10, fat: 35 }
        }
      ],
      high_protein: [
        {
          items: [
            { name: 'Lean Beef Steak', portion: '180g' },
            { name: 'Sweet Potato', portion: '1 medium (150g)' },
            { name: 'Steamed Vegetables', portion: '1 cup (100g)' },
            { name: 'Olive Oil', portion: '1 tsp (5ml)' }
          ],
          nutrition: { calories: 550, protein: 50, carbs: 35, fat: 22 }
        }
      ],
      no_preferences: [
        {
          items: [
            { name: 'Grilled Salmon', portion: '150g' },
            { name: 'Quinoa', portion: '3/4 cup cooked (150g)' },
            { name: 'Roasted Vegetables', portion: '1 cup (100g)' },
            { name: 'Lemon Herb Dressing', portion: '1 tbsp (15ml)' }
          ],
          nutrition: { calories: 580, protein: 40, carbs: 45, fat: 25 }
        },
        {
          items: [
            { name: 'Baked Chicken Breast', portion: '150g' },
            { name: 'Brown Rice', portion: '3/4 cup cooked (150g)' },
            { name: 'Steamed Broccoli', portion: '1 cup (100g)' },
            { name: 'Olive Oil', portion: '1 tbsp (15ml)' }
          ],
          nutrition: { calories: 520, protein: 45, carbs: 40, fat: 18 }
        }
      ]
    },
    snacks: {
      vegetarian: [
        {
          items: [
            { name: 'Greek Yogurt', portion: '1 small container (100g)' },
            { name: 'Almonds', portion: '15g' },
            { name: 'Apple', portion: '1 medium' }
          ],
          nutrition: { calories: 250, protein: 15, carbs: 25, fat: 10 }
        }
      ],
      vegan: [
        {
          items: [
            { name: 'Hummus', portion: '1/4 cup (60g)' },
            { name: 'Carrot & Celery Sticks', portion: '1 cup (100g)' },
            { name: 'Whole Grain Crackers', portion: '5-6 crackers (30g)' }
          ],
          nutrition: { calories: 230, protein: 7, carbs: 30, fat: 9 }
        }
      ],
      keto: [
        {
          items: [
            { name: 'Cheese Cubes', portion: '30g' },
            { name: 'Mixed Nuts', portion: '30g' },
            { name: 'Celery Sticks', portion: '2-3 sticks' }
          ],
          nutrition: { calories: 280, protein: 12, carbs: 5, fat: 24 }
        }
      ],
      high_protein: [
        {
          items: [
            { name: 'Protein Bar', portion: '1 bar (60g)' },
            { name: 'Apple', portion: '1 medium' }
          ],
          nutrition: { calories: 260, protein: 20, carbs: 30, fat: 8 }
        }
      ],
      no_preferences: [
        {
          items: [
            { name: 'Mixed Nuts', portion: '30g' },
            { name: 'Fruit', portion: '1 medium piece' }
          ],
          nutrition: { calories: 270, protein: 8, carbs: 20, fat: 18 }
        },
        {
          items: [
            { name: 'Greek Yogurt', portion: '1 small container (100g)' },
            { name: 'Granola', portion: '2 tbsp (20g)' },
            { name: 'Honey', portion: '1 tsp (5g)' }
          ],
          nutrition: { calories: 200, protein: 15, carbs: 25, fat: 5 }
        }
      ]
    }
  };

  // Select meal options based on preferences
  const mealOptions = meals[type][preferences] || meals[type].no_preferences;
  
  // Select a random meal option
  const randomIndex = Math.floor(Math.random() * mealOptions.length);
  const selectedMeal = mealOptions[randomIndex];
  
  // Return the meal with its type
  return {
    type,
    ...selectedMeal
  };
}
