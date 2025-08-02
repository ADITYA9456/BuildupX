import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Please provide feedback message'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Create model only if it doesn't exist
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

export default Feedback;
