import express from 'express';
import {
  getChatAnalytics,
  getWeeklyReport
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getChatAnalytics);
router.get('/weekly-report', protect, getWeeklyReport);

export default router;
