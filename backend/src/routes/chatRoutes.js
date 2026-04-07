
import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import * as chatController from '../controllers/chatController.js';
import multer from 'multer';
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
// Send an audio message in a chat
router.post('/send-audio', requireAuth, upload.single('audio'), chatController.sendAudioMessage);

// Get or create chat for a product between buyer and seller
router.post('/get-or-create', requireAuth, chatController.getOrCreateChat);
// Get all chats for current user
router.get('/my', requireAuth, chatController.getUserChats);
// Send a message in a chat
router.post('/send', requireAuth, chatController.sendMessage);
// Mark all messages as read
router.post('/read', requireAuth, chatController.markAsRead);

export default router;
