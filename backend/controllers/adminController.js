import User from '../models/user.js';
import Product from '../models/product.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getAdminAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const last30Days = new Date(now);
        last30Days.setDate(last30Days.getDate() - 30);

        const last12MonthsStart = new Date(now);
        last12MonthsStart.setMonth(last12MonthsStart.getMonth() - 11);
        last12MonthsStart.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            suppliers,
            farmers,
            buyers,
            activeUsers,
            products,
            inventoryValue,
            monthlySignups,
            categoryBreakdown,
            recentProducts,
            recentUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'supplier' }),
            User.countDocuments({ role: 'farmer' }),
            User.countDocuments({ role: 'buyer' }),
            User.countDocuments({ updatedAt: { $gte: last30Days } }),
            Product.countDocuments(),
            Product.aggregate([
                { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
            ]),
            User.aggregate([
                { $match: { createdAt: { $gte: last12MonthsStart } } },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            Product.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 6 }
            ]),
            Product.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .select('productName category createdAt'),
            User.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .select('fullName role createdAt')
        ]);

        const inventoryTotal = inventoryValue.length > 0 ? inventoryValue[0].total : 0;

        const labels = [];
        const dataPoints = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(now.getMonth() - i);
            const label = `${MONTH_NAMES[date.getMonth()]}`;
            labels.push(label);

            const monthData = monthlySignups.find(entry => {
                return entry._id.year === date.getFullYear() && entry._id.month === date.getMonth() + 1;
            });
            dataPoints.push(monthData ? monthData.count : 0);
        }

        const userGrowth = {
            labels,
            data: dataPoints
        };

        const userRoles = {
            labels: ['Farmers', 'Suppliers', 'Buyers'],
            data: [farmers, suppliers, buyers]
        };

        const supplierCategories = {
            labels: categoryBreakdown.map(item => formatCategory(item._id)),
            data: categoryBreakdown.map(item => item.count)
        };

        const activity = buildActivityFeed(recentUsers, recentProducts);

        res.json({
            metrics: {
                activeUsers,
                totalUsers,
                supplierCount: suppliers,
                listingCount: products,
                inventoryValue: Math.round(inventoryTotal),
            },
            charts: {
                userGrowth,
                userRoles,
                supplierCategories
            },
            activity
        });
    } catch (error) {
        console.error('Admin analytics error:', error);
        res.status(500).json({ message: 'Failed to load analytics data' });
    }
};

function formatCategory(category = '') {
    if (!category) return 'Uncategorized';
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function buildActivityFeed(users, products) {
    const feed = [];

    users.forEach(user => {
        feed.push({
            icon: 'fa-user-plus',
            color: '#27ae60',
            timestamp: user.createdAt,
            text: `${user.fullName || 'New user'} joined as ${user.role || 'member'}.`
        });
    });

    products.forEach(product => {
        feed.push({
            icon: 'fa-box-open',
            color: '#2980b9',
            timestamp: product.createdAt,
            text: `New product “${product.productName}” added (${product.category || 'uncategorized'}).`
        });
    });

    return feed
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 6)
        .map(item => {
            return {
                icon: item.icon,
                color: item.color,
                text: item.text,
                timestamp: item.timestamp
            };
        });
}

