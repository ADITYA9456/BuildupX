import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { Meal } from '@/models/Meal';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

// GET a specific meal
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const mealId = params.id;
    
    // Get the meal
    const meal = await Meal.findOne({ _id: mealId, userId });
    
    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }
    
    return NextResponse.json({ meal });
  } catch (error) {
    console.error('Get meal error:', error);
    return NextResponse.json({ error: 'Failed to get meal' }, { status: 500 });
  }
}

// UPDATE a meal
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const mealId = params.id;
    const data = await request.json();
    
    // Find the meal
    const meal = await Meal.findOne({ _id: mealId, userId });
    
    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }
    
    // Update meal fields
    if (data.name) meal.name = data.name;
    if (data.date) meal.date = data.date;
    if (data.mealTime) meal.mealTime = data.mealTime;
    
    // Update foods if provided
    if (data.foods && data.foods.length > 0) {
      meal.foods = data.foods;
      
      // Recalculate totals
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      data.foods.forEach(food => {
        totalCalories += food.calories || 0;
        totalProtein += food.protein || 0;
        totalCarbs += food.carbs || 0;
        totalFat += food.fat || 0;
      });
      
      meal.totalCalories = totalCalories;
      meal.totalProtein = totalProtein;
      meal.totalCarbs = totalCarbs;
      meal.totalFat = totalFat;
    }
    
    // Save changes
    await meal.save();
    
    return NextResponse.json({
      success: true,
      message: 'Meal updated successfully',
      meal
    });
  } catch (error) {
    console.error('Update meal error:', error);
    return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
  }
}

// DELETE a meal
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const mealId = params.id;
    
    // Find and delete the meal
    const result = await Meal.deleteOne({ _id: mealId, userId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Meal not found or not authorized to delete' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }
}
