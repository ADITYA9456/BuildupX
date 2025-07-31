import { connectDB } from '@/lib/db';
import { FoodLibrary } from '@/models/FoodLibrary';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get the search query from URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }
    
    // Search for foods matching the query
    const foods = await FoodLibrary.find({
      name: { $regex: query, $options: 'i' } // Case-insensitive search
    }).limit(20);
    
    return NextResponse.json({ foods });
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json({ error: 'Failed to search foods' }, { status: 500 });
  }
}

// API to add new food items to the database (for admin use)
export async function POST(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get food data from request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.calories) {
      return NextResponse.json({ error: 'Name and calories are required' }, { status: 400 });
    }
    
    // Create new food entry
    const newFood = new FoodLibrary({
      name: data.name,
      calories: data.calories,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fat: data.fat || 0,
      fiber: data.fiber || 0,
      servingSize: data.servingSize || '100g',
      category: data.category || 'other'
    });
    
    // Save to database
    await newFood.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Food added successfully', 
      food: newFood 
    });
  } catch (error) {
    console.error('Add food error:', error);
    return NextResponse.json({ error: 'Failed to add food' }, { status: 500 });
  }
}
