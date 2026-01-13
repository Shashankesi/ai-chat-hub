import express from 'express';
import {
  updateProfile,
  updatePrivacySettings,
  toggleFocusMode,
  searchUsers,
  getUserById
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/privacy', protect, updatePrivacySettings);
router.put('/focus-mode', protect, toggleFocusMode);
router.get('/search', protect, searchUsers);
router.get('/:userId', protect, getUserById);

export default router;
