import mongoose from 'mongoose';

// Connection state object
const connection = {
  isConnected: false,
};

// Connect to MongoDB
async function connectDB() {
  // If already connected, return
  if (connection.isConnected) {
    return;
  }

  // Use new db connection
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

export { connectDB };
