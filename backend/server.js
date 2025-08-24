const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'default-jwt-secret-for-development-only';
    console.log('⚠️  JWT_SECRET not set, using default (NOT recommended for production)');
}

const app = express();

app.use(express.json());
app.use(cors());

// Import routes
try {
  console.log('🔄 Loading auth routes...');
  const authRoutes = require('./routes/authRoutes');
  console.log('✅ Auth routes loaded');
  
  console.log('🔄 Loading order routes...');
  const orderRoutes = require('./routes/orderRoutes');
  console.log('✅ Order routes loaded');
  
  console.log('🔄 Registering routes...');
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  
  console.log('✅ All routes registered successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error('❌ Error stack:', error.stack);
  process.exit(1);
}

app.get('/', (req, res) => {
    res.send('Dairy Farm API is running...');
});

// Try to connect to MongoDB, but don't crash if it fails
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/dairy-farm';
        console.log('🔄 Attempting to connect to MongoDB...');
        console.log('🔗 URI:', mongoURI);
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.log('❌ MongoDB Connection Error:', err.message);
        console.log('⚠️  Server will continue without database connection');
        console.log('💡 To use database: Install MongoDB or use MongoDB Atlas');
        console.log('💡 Or create a .env file with MONGO_URI=your_connection_string');
    }
};

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API available at: http://localhost:${PORT}`);
    console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
});
