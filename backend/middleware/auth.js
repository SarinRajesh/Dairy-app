const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        console.log('🔐 Auth middleware - checking token...');
        
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('🔐 Token received:', token ? 'Yes' : 'No');
        
        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        console.log('🔐 Verifying token with secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified successfully, user ID:', decoded.id);
        
        // Add user info to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.name, error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired, please login again' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token, authorization denied' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = auth;
