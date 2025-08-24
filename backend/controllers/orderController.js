const Order = require('../models/Order');
const User = require('../models/User');

// Create a new order
const createOrder = async (req, res) => {
    try {
        console.log('🔄 Creating order...');
        console.log('User ID:', req.user.id);
        console.log('Request body:', req.body);
        
        const { 
            items, 
            deliveryAddress, 
            deliveryDate, 
            deliveryTime, 
            paymentMethod, 
            specialInstructions 
        } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Order items are required'
            });
        }

        if (!deliveryAddress || !deliveryDate) {
            return res.status(400).json({
                message: 'Delivery address and date are required'
            });
        }

        // Validate delivery address
        const requiredAddressFields = ['street', 'city', 'state', 'pincode', 'phone'];
        for (const field of requiredAddressFields) {
            if (!deliveryAddress[field] || !deliveryAddress[field].trim()) {
                return res.status(400).json({
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required in delivery address`
                });
            }
        }

        // Validate phone number
        const cleanPhone = deliveryAddress.phone.replace(/[\s\-\(\)]/g, '');
        if (cleanPhone.length < 10) {
            return res.status(400).json({
                message: 'Phone number must be at least 10 digits'
            });
        }

        // Validate delivery date (must be today or future)
        const deliveryDateObj = new Date(deliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deliveryDateObj < today) {
            return res.status(400).json({
                message: 'Delivery date must be today or a future date'
            });
        }

        // Calculate total price for each item
        const processedItems = items.map(item => ({
            productName: item.productName || 'Fresh Organic Whole Milk',
            quantity: item.quantity,
            pricePerLiter: item.pricePerLiter || 70,
            totalPrice: (item.quantity * (item.pricePerLiter || 70))
        }));

        // Calculate total order amount
        const orderTotal = processedItems.reduce((total, item) => total + item.totalPrice, 0);

        // Create the order
        console.log('🔄 Creating order object...');
        console.log('🔄 Order total calculated:', orderTotal);
        const order = new Order({
            user: req.user.id,
            items: processedItems,
            orderTotal: orderTotal,
            deliveryAddress,
            deliveryDate: deliveryDateObj,
            deliveryTime: deliveryTime || 'morning',
            paymentMethod: paymentMethod || 'cod',
            specialInstructions: specialInstructions || ''
        });

        console.log('🔄 Saving order...');
        await order.save();
        console.log('✅ Order saved successfully');

        // Populate user details
        await order.populate('user', 'firstName lastName email phone');

        res.status(201).json({
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        console.error('❌ Error creating order:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        
        // Check if it's a validation error
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: validationErrors
            });
        }
        
        // Check if it's a database connection error
        if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
            return res.status(500).json({
                message: 'Database connection error. Please try again later.'
            });
        }
        
        res.status(500).json({
            message: 'Server error while creating order'
        });
    }
};

// Get all orders for the authenticated user
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('user', 'firstName lastName email phone')
            .sort({ orderDate: -1 });

        res.json({
            message: 'Orders retrieved successfully',
            orders
        });

    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            message: 'Server error while fetching orders'
        });
    }
};

// Get a specific order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('user', 'firstName lastName email phone');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // Check if the order belongs to the authenticated user
        if (order.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. This order does not belong to you'
            });
        }

        res.json({
            message: 'Order retrieved successfully',
            order
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            message: 'Server error while fetching order'
        });
    }
};

// Cancel an order
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // Check if the order belongs to the authenticated user
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. This order does not belong to you'
            });
        }

        // Check if order can be cancelled (only pending orders)
        if (order.orderStatus !== 'pending') {
            return res.status(400).json({
                message: 'Order cannot be cancelled. It has already been processed.'
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        res.json({
            message: 'Order cancelled successfully',
            order
        });

    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            message: 'Server error while cancelling order'
        });
    }
};

// Get order statistics for admin (optional)
const getOrderStats = async (req, res) => {
    try {
        // Check if user is admin (you can add admin role to User model later)
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
        
        // Calculate total revenue
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: 'delivered' } },
            { $group: { _id: null, totalRevenue: { $sum: '$orderTotal' } } }
        ]);
        
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        res.json({
            message: 'Order statistics retrieved successfully',
            stats: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue
            }
        });

    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).json({
            message: 'Server error while fetching order statistics'
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getOrderStats
};
