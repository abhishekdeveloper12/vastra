import cloudinary from '../utils/cloudinary.js';
import multer from 'multer';
import fs from 'fs';
// Multer setup for audio upload
const upload = multer({ dest: 'uploads/' });

// Send an audio message in a chat
export const sendAudioMessage = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user._id;
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Upload audio to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video', // audio files are uploaded as 'video' in Cloudinary
      folder: 'chat-audio',
      format: 'mp3',
    });
    // Remove local file after upload
    fs.unlinkSync(req.file.path);

    chat.messages.push({ sender: userId, audio: result.secure_url, read: false });
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
import Chat from '../models/Chat.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Get or create chat for a product between buyer and seller
export const getOrCreateChat = async (req, res) => {
  try {
    const { productId, otherUserId } = req.body;
    const userId = req.user._id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    let buyer, seller;
    if (String(product.seller) === String(userId)) {
      seller = userId;
      buyer = otherUserId;
    } else {
      buyer = userId;
      seller = product.seller;
    }
    let chat = await Chat.findOne({ product: productId, buyer, seller });
    if (!chat) {
      chat = new Chat({ product: productId, buyer, seller, messages: [] });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all chats for current user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ $or: [ { buyer: userId }, { seller: userId } ] })
      .populate('product', 'name photos')
      .populate('buyer', 'email')
      .populate('seller', 'email');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const userId = req.user._id;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    chat.messages.push({ sender: userId, text, read: false });
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark all messages as read for a user in a chat
export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user._id;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    chat.messages.forEach(msg => {
      if (String(msg.sender) !== String(userId)) msg.read = true;
    });
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
