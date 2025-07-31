import mongoose from 'mongoose';

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  }
});

const MealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  foods: [
    {
      food: FoodSchema,
      quantity: {
        type: Number,
        default: 1,
        min: 0.1
      },
      unit: {
        type: String,
        default: 'serving'
      }
    }
  ],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  },
  totalFiber: {
    type: Number,
    default: 0
  },
  notes: String
});

// Calculate totals before save
MealSchema.pre('save', function(next) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber = 0;

  this.foods.forEach(item => {
    calories += item.food.calories * item.quantity;
    protein += item.food.protein * item.quantity;
    carbs += item.food.carbs * item.quantity;
    fat += item.food.fat * item.quantity;
    fiber += (item.food.fiber || 0) * item.quantity;
  });

  this.totalCalories = Math.round(calories);
  this.totalProtein = Math.round(protein);
  this.totalCarbs = Math.round(carbs);
  this.totalFat = Math.round(fat);
  this.totalFiber = Math.round(fiber);

  next();
});

export default mongoose.models.Meal || mongoose.model('Meal', MealSchema);
