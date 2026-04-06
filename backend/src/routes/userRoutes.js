import express from 'express';
import { signupUser, deleteUser, getUserByEmail, loginUser, googleAuth } from '../controllers/userController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();



router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/google-auth', googleAuth);
router.post('/by-email', getUserByEmail);
router.delete('/delete', requireAuth, deleteUser);

export default router;
