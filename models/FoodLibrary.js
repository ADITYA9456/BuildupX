import mongoose from 'mongoose';

const FoodLibrarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['fruits', 'vegetables', 'grains', 'protein', 'dairy', 'snacks', 'beverages', 'other'],
    default: 'other'
  },
  servingSize: {
    value: {
      type: Number,
      default: 100
    },
    unit: {
      type: String,
      default: 'g'
    }
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
  },
  fiber: {
    type: Number,
    default: 0
  },
  sugar: {
    type: Number,
    default: 0
  },
  // For search optimization
  tags: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  // Additional tracking fields
  source: {
    type: String,
    enum: ['manual', 'api', 'gemini-ai', 'edamam', 'database'],
    default: 'manual'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search
FoodLibrarySchema.index({ name: 'text', tags: 'text' });

export default mongoose.models.FoodLibrary || mongoose.model('FoodLibrary', FoodLibrarySchema);
