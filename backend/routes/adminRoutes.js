import express from 'express';
import { getAdminAnalytics } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, getAdminAnalytics);

export default router;

