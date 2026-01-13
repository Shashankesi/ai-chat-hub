import express from 'express';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getCurrentUser);

export default router;
