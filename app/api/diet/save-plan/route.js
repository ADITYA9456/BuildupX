import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import DietPlan from '../../../../models/DietPlan';

export async function POST(request) {
  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    // Check if token exists
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Extract user ID from token
    const userId = decoded.id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user data in token' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse request data
    const { dietPlan, duration, preferences } = await request.json();

    // Create diet plan document
    const newDietPlan = new DietPlan({
      userId,
      plan: dietPlan,
      duration,
      preferences,
      createdAt: new Date()
    });

    // Save to database
    await newDietPlan.save();

    return NextResponse.json({
      success: true,
      message: 'Diet plan saved successfully'
    });
  } catch (error) {
    console.error('Error saving diet plan:', error);
    return NextResponse.json({ error: 'Failed to save diet plan' }, { status: 500 });
  }
}
