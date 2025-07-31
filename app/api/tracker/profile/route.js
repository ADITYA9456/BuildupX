import dbConnect from '../../../lib/mongodb';
import UserProfile from '../../../models/UserProfile';

export async function POST(req) {
  try {
    // Connect to the database
    await dbConnect();
    
    const profileData = await req.json();
    
    // Create a new user profile using the Mongoose model
    const userProfile = new UserProfile({
      ...profileData,
    });
    
    // Save the profile
    const savedProfile = await userProfile.save();
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: savedProfile._id 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to save user profile:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
