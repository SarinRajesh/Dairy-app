# Quick Setup Guide

## Database Connection Setup

### 1. Create Environment File
Create a `.env` file in the `backend` folder with:

```env
MONGO_URI=mongodb://localhost:27017/dairy-farm-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

### 2. Install MongoDB
- **Windows**: Download and install from [MongoDB website](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: `sudo apt install mongodb`

### 3. Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 5. Start Frontend
```bash
cd frontend
npm install
npm start
```

## Test Registration

1. Open `http://localhost:3000/register`
2. Fill out the form
3. Submit - should connect to backend and create user in MongoDB
4. Check MongoDB for the new user document

## Common Issues

- **MongoDB not running**: Start MongoDB service
- **Port 5000 in use**: Change PORT in .env file
- **CORS errors**: Ensure backend is running on port 5000
