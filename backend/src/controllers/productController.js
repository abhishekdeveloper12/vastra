// Seller: Mark product as sold
export const markProductSold = async (req, res) => {
  try {
    const { id } = req.params;
    // Only allow seller to mark their own product as sold
    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.user._id, status: 'approved' },
      { status: 'sold' },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found or not allowed' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Admin: Get all pending products
export const getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending' }).populate('seller', 'email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Approve a product
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Reject a product
export const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


import Product from '../models/Product.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

// Add a new product (for seller)
export const addProduct = async (req, res) => {
  try {
    const { name, address, price, reasonForSelling, contactNumber } = req.body;
    const files = req.files || [];
    if (files.length < 5) {
      return res.status(400).json({ error: 'At least 5 photos are required.' });
    }

    // Upload each file to Cloudinary and collect URLs
    const uploadPromises = files.map(file =>
      cloudinary.uploader.upload(file.path, { folder: 'products' })
    );
    const uploadResults = await Promise.all(uploadPromises);
    const photoUrls = uploadResults.map(result => result.secure_url);

    // Optionally, remove local files after upload
    files.forEach(file => {
      fs.unlink(file.path, err => { if (err) console.error('Failed to delete local file:', file.path); });
    });

    const product = new Product({
      seller: req.user._id,
      name,
      photos: photoUrls,
      address,
      price,
      reasonForSelling,
      contactNumber,
      status: 'pending'
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products (for buyer) - only approved
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' }).populate('seller', 'email');
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
