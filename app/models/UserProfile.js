import mongoose from 'mongoose';

// Check if the UserProfile model is already defined
const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', new mongoose.Schema({
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  goal: {
    type: String,
    enum: ['lose', 'maintain', 'gain'],
    required: true
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very active'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}));

export default UserProfile;
