import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    comment: {
      type: String,
      required: [true, 'Message is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact;
