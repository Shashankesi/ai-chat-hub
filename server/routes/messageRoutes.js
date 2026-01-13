import express from 'express';
import {
  sendMessage,
  getMessages,
  deleteMessage,
  togglePinMessage,
  markMessagesAsSeen,
  searchMessages,
  getConversationSummary
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/', protect, upload.single('media'), sendMessage);
router.get('/search', protect, searchMessages);
router.get('/:chatId', protect, getMessages);
router.get('/:chatId/summary', protect, getConversationSummary);
router.delete('/:messageId', protect, deleteMessage);
router.put('/:messageId/pin', protect, togglePinMessage);
router.put('/:chatId/seen', protect, markMessagesAsSeen);

export default router;
