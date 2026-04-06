import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  contact: { type: String, trim: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  password: { type: String },
  googleId: { type: String },
  createdAt: { type: Date, default: () => new Date() },
});

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
