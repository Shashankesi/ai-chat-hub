import express from 'express';
import {
  createChat,
  createGroupChat,
  getChats,
  getChatById,
  updateGroupChat,
  addGroupMembers,
  removeGroupMember,
  updateExpiryRules,
  createPoll,
  votePoll
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createChat);
router.post('/group', protect, createGroupChat);
router.get('/', protect, getChats);
router.get('/:chatId', protect, getChatById);
router.put('/:chatId', protect, updateGroupChat);
router.post('/:chatId/members', protect, addGroupMembers);
router.delete('/:chatId/members/:userId', protect, removeGroupMember);
router.put('/:chatId/expiry', protect, updateExpiryRules);
router.post('/:chatId/polls', protect, createPoll);
router.post('/:chatId/polls/:pollId/vote', protect, votePoll);

export default router;
