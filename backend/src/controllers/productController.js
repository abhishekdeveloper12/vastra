
import Product from '../models/Product.js';

// Add a new product (for seller)
export const addProduct = async (req, res) => {
  try {
    const { name, address, price, reasonForSelling, contactNumber } = req.body;
    const photos = req.files ? req.files.map(file => file.path) : [];
    if (photos.length < 5) {
      return res.status(400).json({ error: 'At least 5 photos are required.' });
    }
    const product = new Product({
      seller: req.user._id,
      name,
      photos,
      address,
      price,
      reasonForSelling,
      contactNumber
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products (for buyer)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get products for a seller
export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
