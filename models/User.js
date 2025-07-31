import crypto from 'crypto';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  salt: String,
  name: String,
  phone: String,
  membership: {
    plan: {
      type: String,
      enum: ['STANDARD', 'ULTIMATE', 'PROFESSIONAL'],
      default: 'STANDARD'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  profile: {
    height: Number, // in cm
    weight: Number, // in kg
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male'
    },
    goal: {
      type: String,
      enum: ['lose', 'maintain', 'gain'],
      default: 'maintain'
    }
  }
}, { timestamps: true });

// Method to set password
UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

// Method to verify password
UserSchema.methods.verifyPassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.password === hash;
};

// Calculate membership end date
UserSchema.pre('save', function(next) {
  if (this.isModified('membership.plan')) {
    // Set end date based on plan (1 month from start date)
    const startDate = this.membership.startDate || new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    this.membership.endDate = endDate;
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
