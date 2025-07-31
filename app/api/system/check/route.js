import { connectDB } from '@/lib/mongodb';
import { FoodLibrary } from '@/models/FoodLibrary';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';

// This API route checks the status of all system components
export async function GET() {
  const status = {
    database: {
      connection: false,
      models: {
        users: { exists: false, count: 0 },
        foods: { exists: false, count: 0 },
        meals: { exists: false, count: 0 }
      }
    },
    auth: {
      configured: false
    },
    api: {
      endpoints: {
        food: { status: 'unchecked' },
        meal: { status: 'unchecked' },
        user: { status: 'unchecked' },
        auth: { status: 'unchecked' },
        payment: { status: 'unchecked' }
      }
    }
  };

  // Check database connection
  try {
    await connectDB();
    status.database.connection = true;
    
    // Check User model
    try {
      const userCount = await User.countDocuments();
      status.database.models.users.exists = true;
      status.database.models.users.count = userCount;
    } catch (e) {
      console.error('User model error:', e);
    }
    
    // Check Food model
    try {
      const foodCount = await FoodLibrary.countDocuments();
      status.database.models.foods.exists = true;
      status.database.models.foods.count = foodCount;
    } catch (e) {
      console.error('Food model error:', e);
    }
    
    // Check auth configuration
    if (process.env.NEXTAUTH_SECRET) {
      status.auth.configured = true;
    }
    
    // Check API endpoints by pinging them
    const apiChecks = [
      { name: 'foods', path: '/api/foods/search?q=rice' },
      { name: 'meal', path: '/api/meal' },
      { name: 'user', path: '/api/user/create' },
      { name: 'auth', path: '/api/auth/csrf' },
      { name: 'payment', path: '/api/payment/verify' }
    ];
    
    for (const check of apiChecks) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}${check.path}`, { 
          method: 'HEAD',
          headers: { 'x-system-check': 'true' }
        });
        
        status.api.endpoints[check.name].status = response.status < 500 ? 'available' : 'error';
      } catch (e) {
        status.api.endpoints[check.name].status = 'error';
      }
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }

  // Add system timestamp
  status.timestamp = new Date().toISOString();
  status.environment = process.env.NODE_ENV || 'development';

  return NextResponse.json(status);
}
