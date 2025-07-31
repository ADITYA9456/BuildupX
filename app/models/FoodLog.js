import mongoose from 'mongoose';

// Check if the FoodLog model is already defined
const FoodLog = mongoose.models.FoodLog || mongoose.model('FoodLog', new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  meal: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
    required: true
  },
  food: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  }
}));

export default FoodLog;
