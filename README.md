# Dairy Farm App

A full-stack web application for managing dairy farm operations, including user registration, milk ordering, and farm management.

## Features

- **User Authentication**: Secure registration and login system
- **Milk Management**: Track milk production and orders
- **Order System**: Customer milk ordering functionality
- **Responsive Design**: Modern, mobile-friendly UI
- **Real-time Updates**: Live data synchronization

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt for password hashing
- CORS enabled

### Frontend
- React.js
- React Router for navigation
- CSS3 with modern design
- Responsive layout

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dairy-farm-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/dairy-farm-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

**Note**: Replace the JWT_SECRET with a strong, unique secret key for production.

### 4. Database Setup
Make sure MongoDB is running on your system:
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (macOS/Linux)
sudo systemctl start mongod
```

### 5. Start Backend Server
```bash
npm run dev
```
The backend will start on `http://localhost:5000`

### 6. Frontend Setup
```bash
cd ../frontend
npm install
```

### 7. Start Frontend Development Server
```bash
npm start
```
The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/auth/profile` - Get user profile (protected)

### Milk Management
- `GET /api/milk` - Get milk inventory
- `POST /api/milk` - Add milk to inventory
- `PUT /api/milk/:id` - Update milk record
- `DELETE /api/milk/:id` - Delete milk record

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

## Database Schema

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String (required),
  password: String (required, hashed),
  role: String (enum: ['buyer', 'seller'], default: 'buyer'),
  timestamps: true
}
```

### Milk Model
```javascript
{
  quantity: Number (required),
  price: Number (required),
  date: Date (required),
  farmId: ObjectId (ref: 'User'),
  timestamps: true
}
```

### Order Model
```javascript
{
  customerId: ObjectId (ref: 'User'),
  milkId: ObjectId (ref: 'Milk'),
  quantity: Number (required),
  totalPrice: Number (required),
  status: String (enum: ['pending', 'confirmed', 'delivered']),
  timestamps: true
}
```

## Usage

### Registration
1. Navigate to `/register`
2. Fill in your details (first name, last name, email, phone, password)
3. Agree to terms and conditions
4. Click "Create Customer Account"

### Login
1. Navigate to `/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the home page upon successful login

## Development

### Backend Development
- The backend uses nodemon for automatic restart during development
- API routes are organized in the `routes/` directory
- Controllers handle business logic in the `controllers/` directory
- Models define database schemas in the `models/` directory

### Frontend Development
- React components are organized by feature
- CSS files are co-located with their components
- API calls are centralized in the `services/api.js` file

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Input validation and sanitization
- CORS configuration for cross-origin requests

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB service is running
   - Check connection string in `.env` file
   - Verify MongoDB port (default: 27017)

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes using the port

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set in `.env`
   - Check token expiration time

4. **CORS Errors**
   - Verify backend CORS configuration
   - Check frontend API base URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
