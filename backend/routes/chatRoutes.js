import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Your auth check
import { getConversations, getMessages, sendMessage } from '../controllers/chatController.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/message', protect, sendMessage);

export default router;