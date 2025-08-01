import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import User from '../../../../models/User';
import UserProfile from '../../../../models/UserProfile';

// API endpoint to get user profile data
export async function GET() {
  try {
    // Get the token from cookies
    const token = cookies().get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to database
    await connectDB();
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
      
      try {
        // Get the user from database
        const user = await User.findById(decoded.id).select('-password -salt');
        
        if (user) {
          // Try to get the separate UserProfile document if it exists
          const userProfile = await UserProfile.findOne({ userId: user._id }).sort({ createdAt: -1 });
          
          // Combine user data with profile data (prioritize separate profile if exists)
          const profileData = {
            name: user.name,
            email: user.email,
            membership: user.membership?.plan || 'STANDARD',
            profile: {
              // Use dedicated UserProfile data if available, otherwise fall back to User.profile
              height: userProfile?.height || user.profile?.height || null,
              weight: userProfile?.weight || user.profile?.weight || null,
              age: userProfile?.age || user.profile?.age || null,
              gender: userProfile?.gender || user.profile?.gender || 'male',
              goal: userProfile?.goal || user.profile?.goal || 'maintain',
              activityLevel: userProfile?.activityLevel || 'moderate'
            }
          };
          
          console.log('Sending profile data:', profileData);
          
          // Return combined profile data
          return NextResponse.json({
            success: true,
            profile: profileData
          });
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // Fall through to return mock data
      }
      
      // Return mock profile data if user not found or DB error
      return NextResponse.json({
        success: true,
        profile: {
          name: "User",
          email: decoded.email || "user@example.com",
          membership: "STANDARD",
          profile: {
            height: 170,
            weight: 70,
            age: 30,
            gender: 'male',
            goal: 'maintain'
          }
        }
      });
      
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
  }
}

// API endpoint to update user profile data
export async function POST(request) {
  try {
    await connectDB();
    
    // Get the token from cookies
    const token = cookies().get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.text();
    let profileData;
    
    try {
      profileData = JSON.parse(body);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
      
      // Get the user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Update profile data
      if (profileData.height) user.profile.height = profileData.height;
      if (profileData.weight) user.profile.weight = profileData.weight;
      if (profileData.age) user.profile.age = profileData.age;
      if (profileData.gender) user.profile.gender = profileData.gender;
      if (profileData.goal) user.profile.goal = profileData.goal;
      
      await user.save();
      
      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully'
      });
      
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
