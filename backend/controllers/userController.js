import User from '../models/user.js';

// @desc    Search for users by name
// @route   GET /api/users/search?query=john
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === '') {
            return res.json([]); // Return empty array if no query
        }

        // Search by fullName, exclude the current user
        const users = await User.find({
            fullName: { $regex: query.trim(), $options: 'i' }, // Case insensitive search
            _id: { $ne: req.user._id } // Don't show myself in search results
        }).select('fullName email role'); // Only return necessary info

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: error.message });
    }
};