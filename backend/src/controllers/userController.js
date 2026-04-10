import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import dotenv from 'dotenv';
dotenv.config();
// Manual login
export const loginUser = async (req, res) => {
    console.log('LOGIN REQUEST:', req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // Check for hardcoded admin credentials
    if (
      email.trim().toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Return a fake admin user (no DB lookup)
      const token = generateToken({ userId: 'admin', role: 'admin' });
      return res.json({ token, userId: 'admin', role: 'admin' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // User does not exist
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.password) {
      // User exists but no password set (maybe Google auth only)
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid =await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken({ userId: user._id, role: user.role });
    console.log('LOGIN SUCCESS:', user.email);
    res.json({ token, userId: user._id, role: user.role });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Google auth (sign in/up)
// Note: This will auto-create a user if not found (intended for Google sign-in)
export const googleAuth = async (req, res) => {
    console.log('GOOGLE AUTH REQUEST:', req.body);
  try {
    const { email, firstName, googleId, contact, role } = req.body;
    if (!email || !googleId) return res.status(400).json({ message: 'Email and googleId required' });
    let user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      user = new User({
        firstName,
        email: email.trim().toLowerCase(),
        contact,
        role: role || 'buyer',
        googleId,
      });
      await user.save();
    }
    const token = generateToken({ userId: user._id, role: user.role });
    console.log('GOOGLE AUTH SUCCESS:', user.email);
    res.json({ token, userId: user._id, role: user.role });
  } catch (error) {
    console.error('GOOGLE AUTH ERROR:', error);
    res.status(500).json({ message: 'Google auth failed' });
  }
};
// Get user by email (for signin)
export const getUserByEmail = async (req, res) => {
    console.log('GET USER BY EMAIL REQUEST:', req.body);
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    console.log('GET USER BY EMAIL SUCCESS:', user.email);
    res.json({ userId: user._id, role: user.role });
  } catch (error) {
    console.error('GET USER BY EMAIL ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};
// Delete user profile
export const deleteUser = async (req, res) => {
    console.log('DELETE USER REQUEST:', req.body);
  try {
    const userId = req.user?._id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    await User.findByIdAndDelete(userId);
    console.log('DELETE USER SUCCESS:', userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('DELETE USER ERROR:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
import User from '../models/User.js';

export const signupUser = async (req, res) => {
    console.log('SIGNUP REQUEST:', req.body);
  try {
    const { firstName, email, contact, role, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const hashed = hashPassword(password);
    const user = new User({
      firstName,
      email: normalizedEmail,
      contact,
      role: role || 'buyer',
      password: hashed,
    });
    await user.save();
    const token = generateToken({ userId: user._id, role: user.role });
    console.log('SIGNUP SUCCESS:', user.email);
    res.status(201).json({ message: 'User created successfully', userId: user._id, token, role: user.role });
  } catch (error) {
    console.error('SIGNUP ERROR:', error);
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
