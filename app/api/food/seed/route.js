import { connectDB } from '@/lib/db';
import { FoodLibrary } from '@/models/FoodLibrary';
import { NextResponse } from 'next/server';

// Extensive seed data for global foods including snacks, fast food, and various cuisines
const seedFoods = [
  // Indian Foods
  {
    name: 'Rice (Basmati, cooked)',
    calories: 130,
    protein: 2.7,
    carbs: 28.2,
    fat: 0.3,
    fiber: 0.4,
    servingSize: '100g',
    category: 'indian'
  },
  {
    name: 'Chapati/Roti',
    calories: 120,
    protein: 3.1,
    carbs: 20.5,
    fat: 3.1,
    fiber: 1.2,
    servingSize: '1 piece',
    category: 'indian'
  },
  {
    name: 'Dal Makhani',
    calories: 180,
    protein: 9.0,
    carbs: 23.0,
    fat: 7.5,
    fiber: 7.0,
    servingSize: '100g',
    category: 'indian'
  },
  {
    name: 'Butter Chicken',
    calories: 320,
    protein: 18.0,
    carbs: 10.0,
    fat: 24.0,
    fiber: 1.0,
    servingSize: '100g',
    category: 'indian'
  },
  {
    name: 'Samosa',
    calories: 262,
    protein: 4.3,
    carbs: 33.5,
    fat: 12.4,
    fiber: 2.2,
    servingSize: '1 piece (60g)',
    category: 'indian'
  },
  {
    name: 'Chole Bhature',
    calories: 427,
    protein: 11.0,
    carbs: 48.0,
    fat: 22.0,
    fiber: 9.5,
    servingSize: '1 plate',
    category: 'indian'
  },
  {
    name: 'Biryani (Chicken)',
    calories: 255,
    protein: 15.8,
    carbs: 28.5,
    fat: 9.2,
    fiber: 1.8,
    servingSize: '100g',
    category: 'indian'
  },
  {
    name: 'Rasgulla',
    calories: 186,
    protein: 4.0,
    carbs: 42.0,
    fat: 0.2,
    fiber: 0.0,
    servingSize: '2 pieces',
    category: 'indian'
  },
  {
    name: 'Jalebi',
    calories: 150,
    protein: 2.0,
    carbs: 32.0,
    fat: 3.0,
    fiber: 0.0,
    servingSize: '1 piece',
    category: 'indian'
  },
  
  // Chinese Foods
  {
    name: 'Fried Rice',
    calories: 163,
    protein: 3.5,
    carbs: 28.0,
    fat: 4.5,
    fiber: 0.8,
    servingSize: '100g',
    category: 'chinese'
  },
  {
    name: 'Chow Mein',
    calories: 237,
    protein: 7.8,
    carbs: 40.0,
    fat: 5.2,
    fiber: 2.0,
    servingSize: '100g',
    category: 'chinese'
  },
  {
    name: 'Spring Roll',
    calories: 120,
    protein: 3.0,
    carbs: 16.5,
    fat: 5.0,
    fiber: 0.8,
    servingSize: '1 piece',
    category: 'chinese'
  },
  {
    name: 'Kung Pao Chicken',
    calories: 220,
    protein: 16.0,
    carbs: 12.0,
    fat: 13.0,
    fiber: 2.0,
    servingSize: '100g',
    category: 'chinese'
  },
  {
    name: 'Sweet and Sour Pork',
    calories: 231,
    protein: 11.0,
    carbs: 26.0,
    fat: 10.0,
    fiber: 1.0,
    servingSize: '100g',
    category: 'chinese'
  },
  {
    name: 'Dim Sum (Shrimp)',
    calories: 40,
    protein: 3.0,
    carbs: 4.5,
    fat: 1.5,
    fiber: 0.2,
    servingSize: '1 piece',
    category: 'chinese'
  },
  {
    name: 'Mapo Tofu',
    calories: 170,
    protein: 9.0,
    carbs: 5.0,
    fat: 13.0,
    fiber: 2.0,
    servingSize: '100g',
    category: 'chinese'
  },
  
  // Korean Foods
  {
    name: 'Kimchi',
    calories: 23,
    protein: 1.0,
    carbs: 4.0,
    fat: 0.5,
    fiber: 1.6,
    servingSize: '100g',
    category: 'korean'
  },
  {
    name: 'Bibimbap',
    calories: 420,
    protein: 18.0,
    carbs: 60.0,
    fat: 12.0,
    fiber: 6.0,
    servingSize: '1 bowl',
    category: 'korean'
  },
  {
    name: 'Korean Fried Chicken',
    calories: 320,
    protein: 22.0,
    carbs: 16.0,
    fat: 20.0,
    fiber: 0.5,
    servingSize: '100g',
    category: 'korean'
  },
  {
    name: 'Bulgogi',
    calories: 250,
    protein: 24.0,
    carbs: 10.0,
    fat: 13.0,
    fiber: 1.0,
    servingSize: '100g',
    category: 'korean'
  },
  {
    name: 'Japchae',
    calories: 221,
    protein: 5.0,
    carbs: 32.0,
    fat: 8.0,
    fiber: 2.0,
    servingSize: '100g',
    category: 'korean'
  },
  {
    name: 'Tteokbokki',
    calories: 224,
    protein: 5.0,
    carbs: 46.0,
    fat: 2.0,
    fiber: 1.5,
    servingSize: '100g',
    category: 'korean'
  },
  
  // Mexican Foods
  {
    name: 'Taco',
    calories: 210,
    protein: 9.0,
    carbs: 20.0,
    fat: 10.0,
    fiber: 3.0,
    servingSize: '1 taco',
    category: 'mexican'
  },
  {
    name: 'Burrito',
    calories: 430,
    protein: 16.0,
    carbs: 55.0,
    fat: 16.0,
    fiber: 8.0,
    servingSize: '1 burrito',
    category: 'mexican'
  },
  {
    name: 'Quesadilla',
    calories: 330,
    protein: 14.0,
    carbs: 28.0,
    fat: 18.0,
    fiber: 2.0,
    servingSize: '1 quesadilla',
    category: 'mexican'
  },
  {
    name: 'Nachos with Cheese',
    calories: 346,
    protein: 8.0,
    carbs: 34.0,
    fat: 19.0,
    fiber: 4.0,
    servingSize: '100g',
    category: 'mexican'
  },
  
  // Fast Food
  {
    name: 'Hamburger',
    calories: 254,
    protein: 14.0,
    carbs: 27.0,
    fat: 10.0,
    fiber: 1.0,
    servingSize: '1 burger',
    category: 'fast_food'
  },
  {
    name: 'Cheeseburger',
    calories: 303,
    protein: 16.0,
    carbs: 30.0,
    fat: 13.0,
    fiber: 1.0,
    servingSize: '1 burger',
    category: 'fast_food'
  },
  {
    name: 'French Fries',
    calories: 312,
    protein: 3.4,
    carbs: 41.0,
    fat: 15.0,
    fiber: 3.8,
    servingSize: 'Medium serving',
    category: 'fast_food'
  },
  {
    name: 'Fried Chicken (Piece)',
    calories: 245,
    protein: 24.0,
    carbs: 8.0,
    fat: 14.0,
    fiber: 0.5,
    servingSize: '1 piece',
    category: 'fast_food'
  },
  {
    name: 'Chicken Nuggets',
    calories: 59,
    protein: 3.6,
    carbs: 3.6,
    fat: 3.7,
    fiber: 0.1,
    servingSize: '1 nugget',
    category: 'fast_food'
  },
  {
    name: 'Hot Dog',
    calories: 290,
    protein: 10.0,
    carbs: 18.0,
    fat: 19.0,
    fiber: 1.0,
    servingSize: '1 hot dog',
    category: 'fast_food'
  },
  {
    name: 'Pizza (Pepperoni)',
    calories: 298,
    protein: 12.0,
    carbs: 34.0,
    fat: 12.0,
    fiber: 2.0,
    servingSize: '1 slice',
    category: 'fast_food'
  },
  
  // Dairy Products
  {
    name: 'Milk (Whole)',
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    fiber: 0.0,
    servingSize: '100ml',
    category: 'dairy'
  },
  {
    name: 'Milk (Low-fat)',
    calories: 42,
    protein: 3.4,
    carbs: 5.0,
    fat: 1.0,
    fiber: 0.0,
    servingSize: '100ml',
    category: 'dairy'
  },
  {
    name: 'Yogurt (Plain)',
    calories: 59,
    protein: 3.5,
    carbs: 4.7,
    fat: 3.3,
    fiber: 0.0,
    servingSize: '100g',
    category: 'dairy'
  },
  {
    name: 'Greek Yogurt',
    calories: 73,
    protein: 10.0,
    carbs: 3.6,
    fat: 1.9,
    fiber: 0.0,
    servingSize: '100g',
    category: 'dairy'
  },
  {
    name: 'Cheddar Cheese',
    calories: 402,
    protein: 25.0,
    carbs: 1.3,
    fat: 33.0,
    fiber: 0.0,
    servingSize: '100g',
    category: 'dairy'
  },
  {
    name: 'Paneer',
    calories: 265,
    protein: 18.3,
    carbs: 3.1,
    fat: 20.8,
    fiber: 0,
    servingSize: '100g',
    category: 'dairy'
  },
  
  // Snacks & Packaged Foods
  {
    name: 'Potato Chips',
    calories: 536,
    protein: 7.0,
    carbs: 53.0,
    fat: 35.0,
    fiber: 4.8,
    servingSize: '100g',
    category: 'snacks'
  },
  {
    name: 'Kurkure',
    calories: 557,
    protein: 6.2,
    carbs: 56.0,
    fat: 33.0,
    fiber: 1.0,
    servingSize: '100g',
    category: 'snacks'
  },
  {
    name: 'Popcorn',
    calories: 375,
    protein: 11.0,
    carbs: 74.0,
    fat: 4.3,
    fiber: 14.5,
    servingSize: '100g',
    category: 'snacks'
  },
  {
    name: 'Chocolate Bar (Milk)',
    calories: 535,
    protein: 7.7,
    carbs: 59.0,
    fat: 30.0,
    fiber: 3.4,
    servingSize: '100g',
    category: 'snacks'
  },
  {
    name: 'Peanuts',
    calories: 567,
    protein: 26.0,
    carbs: 16.0,
    fat: 49.0,
    fiber: 8.5,
    servingSize: '100g',
    category: 'snacks'
  },
  {
    name: 'Parle-G Biscuit',
    calories: 38,
    protein: 0.7,
    carbs: 7.0,
    fat: 0.8,
    fiber: 0.2,
    servingSize: '1 biscuit',
    category: 'snacks'
  },
  {
    name: 'Oreo Cookie',
    calories: 47,
    protein: 0.5,
    carbs: 7.0,
    fat: 2.0,
    fiber: 0.3,
    servingSize: '1 cookie',
    category: 'snacks'
  },
  {
    name: 'Maggi Noodles',
    calories: 188,
    protein: 4.0,
    carbs: 27.0,
    fat: 7.5,
    fiber: 1.0,
    servingSize: '1 packet',
    category: 'snacks'
  },
  {
    name: 'Aloo Bhujia',
    calories: 560,
    protein: 12.0,
    carbs: 50.0,
    fat: 36.0,
    fiber: 3.0,
    servingSize: '100g',
    category: 'snacks'
  },
  
  // Fruits and Vegetables
  {
    name: 'Apple',
    calories: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2,
    fiber: 2.4,
    servingSize: '1 medium (182g)',
    category: 'fruits'
  },
  {
    name: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    servingSize: '1 medium (118g)',
    category: 'fruits'
  },
  {
    name: 'Broccoli',
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    fiber: 2.6,
    servingSize: '100g',
    category: 'vegetables'
  },
  {
    name: 'Carrots',
    calories: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    fiber: 2.8,
    servingSize: '100g',
    category: 'vegetables'
  },
  
  // Beverages
  {
    name: 'Coca-Cola',
    calories: 42,
    protein: 0.0,
    carbs: 10.6,
    fat: 0.0,
    fiber: 0.0,
    servingSize: '100ml',
    category: 'beverages'
  },
  {
    name: 'Orange Juice',
    calories: 45,
    protein: 0.7,
    carbs: 10.4,
    fat: 0.2,
    fiber: 0.2,
    servingSize: '100ml',
    category: 'beverages'
  },
  {
    name: 'Masala Chai',
    calories: 106,
    protein: 3.2,
    carbs: 10.4,
    fat: 5.8,
    fiber: 0,
    servingSize: '200ml',
    category: 'beverages'
  },
  
  // Supplements
  {
    name: 'Whey Protein',
    calories: 113,
    protein: 24.0,
    carbs: 2.0,
    fat: 1.0,
    fiber: 0,
    servingSize: '30g scoop',
    category: 'supplements'
  },
  {
    name: 'Protein Bar',
    calories: 240,
    protein: 20.0,
    carbs: 24.0,
    fat: 8.0,
    fiber: 2.5,
    servingSize: '60g bar',
    category: 'supplements'
  }
];

export async function GET(request) {
  try {
    await connectDB();
    
    // Check if foods already exist
    const existingCount = await FoodLibrary.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: `Food database already contains ${existingCount} items. No seeding required.`,
        seeded: false
      });
    }
    
    // Insert all foods
    await FoodLibrary.insertMany(seedFoods);
    
    return NextResponse.json({ 
      message: `Successfully seeded ${seedFoods.length} food items to database.`,
      seeded: true,
      count: seedFoods.length
    });
  } catch (error) {
    console.error('Error seeding food database:', error);
    return NextResponse.json({ error: 'Failed to seed food database' }, { status: 500 });
  }
}
