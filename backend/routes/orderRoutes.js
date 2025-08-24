const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderById, cancelOrder, getOrderStats } = require('../controllers/orderController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create a new order
router.post('/create', (req, res, next) => {
    console.log('📦 Order creation route hit');
    console.log('📦 Request body:', req.body);
    console.log('📦 User from auth:', req.user);
    next();
}, createOrder);

// Get all orders for the authenticated user
router.get('/my-orders', getUserOrders);

// Get order statistics (for admin - optional)
router.get('/stats/overview', getOrderStats);

// Get a specific order by ID
router.get('/:orderId', getOrderById);

// Cancel an order
router.put('/:orderId/cancel', cancelOrder);

module.exports = router;
