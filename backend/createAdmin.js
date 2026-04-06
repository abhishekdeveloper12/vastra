import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clothes2';

async function createAdmin() {
  await mongoose.connect(MONGO_URI);
  const email = 'admin@example.com';
  const password = 'Admin@123';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }
  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    firstName: 'Admin',
    email,
    password: hashed,
    role: 'admin',
  });
  console.log('Admin user created:', email);
  process.exit(0);
}

createAdmin();
