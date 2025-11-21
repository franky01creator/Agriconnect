import express from 'express';
import { searchUsers } from '../controllers/userController.js'; // Import the new function
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ... existing login/register routes ...

// Add this new route:
router.get('/search', protect, searchUsers);

export default router;