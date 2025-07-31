import mongoose from 'mongoose';

// Check if the Payment model is already defined
const Payment = mongoose.models.Payment || mongoose.model('Payment', new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  plan: {
    type: String,
    required: true,
    enum: ['STANDARD', 'ULTIMATE', 'PROFESSIONAL']
  },
  amount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: false
  },
  orderId: {
    type: String,
    required: false
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'success', 'failed']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}));

export default Payment;
