import express from 'express';
import { signupUser, deleteUser, getUserByEmail, loginUser, googleAuth } from '../controllers/userController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();



router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/google-auth', googleAuth);
router.post('/by-email', getUserByEmail);

// Token validation endpoint for frontend
import jwt from 'jsonwebtoken';
router.post('/validate-token', (req, res) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.json({ valid: false });
	}
	const token = authHeader.split(' ')[1];
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme_secret');
		if (!payload || !payload.userId) return res.json({ valid: false });
		return res.json({ valid: true });
	} catch {
		return res.json({ valid: false });
	}
});

router.delete('/delete', requireAuth, deleteUser);

export default router;
