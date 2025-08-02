import mongoose from 'mongoose';

const DietPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: Object,
    required: true
  },
  duration: {
    type: String,
    enum: ['day', 'week'],
    default: 'day'
  },
  preferences: {
    type: String,
    default: 'no_preferences'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DietPlan = mongoose.models.DietPlan || mongoose.model('DietPlan', DietPlanSchema);

export default DietPlan;
