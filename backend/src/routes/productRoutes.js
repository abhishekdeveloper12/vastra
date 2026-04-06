import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as productController from '../controllers/productController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Admin gets all pending products
router.get('/pending', requireAuth, requireAdmin, productController.getPendingProducts);
// Admin approves a product
router.patch('/approve/:id', requireAuth, requireAdmin, productController.approveProduct);
// Admin rejects a product
router.patch('/reject/:id', requireAuth, requireAdmin, productController.rejectProduct);
// Seller adds a product
router.post('/add', requireAuth, upload.array('photos', 10), productController.addProduct);
// Buyer gets all products
router.get('/all', productController.getAllProducts);
// Seller gets their products
router.get('/seller', requireAuth, productController.getSellerProducts);
// Seller marks product as sold
router.patch('/sold/:id', requireAuth, productController.markProductSold);

export default router;
