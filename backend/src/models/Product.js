import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sold'],
      default: 'pending',
    },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  photos: {
    type: [String],
    validate: [arr => arr.length >= 5, 'At least 5 photos are required'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  reasonForSelling: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', productSchema);
