# PulseChat - Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
# Backend
cd server
npm install

# Frontend  
cd ../client
npm install
```

### Step 2: Setup Environment Variables (1 minute)

```bash
# Create server/.env
cd server
cp .env.example .env
```

Edit `server/.env` with minimum required values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pulsechat
JWT_SECRET=my-super-secret-key-change-in-production
JWT_REFRESH_SECRET=my-refresh-secret-key-change-in-production
OPENAI_API_KEY=sk-your-openai-api-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
# Create client/.env
cd ../client
echo "VITE_API_URL=http://localhost:5000" > .env
```

### Step 3: Start MongoDB (if using local)

```bash
# Option 1: Local MongoDB
mongod

# Option 2: MongoDB Atlas (recommended)
# Use connection string in server/.env
# Example: mongodb+srv://username:password@cluster.mongodb.net/pulsechat
```

### Step 4: Run Development Servers (1 minute)

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Step 5: Access Application

Open browser to: **http://localhost:5173**

## 🎯 Test the Application

### 1. Register Two Users
- Open browser → Register account (User A)
- Open incognito window → Register account (User B)

### 2. Start Chatting
- User A: Search for User B
- Create chat
- Send messages
- See real-time delivery

### 3. Test Features
- **Typing Indicators**: Start typing, see indicator
- **Online Status**: Check green dot
- **Smart Replies**: Send message, wait for AI suggestions
- **Focus Mode**: Enable in User B, see auto-reply
- **Analytics**: Visit /analytics page

## 🚀 Optional: Get API Keys

### OpenAI (for AI features)
1. Go to https://platform.openai.com
2. Sign up / Login
3. Create API key
4. Add to `server/.env` as `OPENAI_API_KEY`

### Cloudinary (for media uploads)
1. Go to https://cloudinary.com
2. Sign up free
3. Get cloud name, API key, API secret from dashboard
4. Add to `server/.env`

### MongoDB Atlas (for cloud database)
1. Go to https://www.mongodb.com/atlas
2. Create free cluster
3. Create database user
4. Get connection string
5. Replace `MONGODB_URI` in `server/.env`

## 📝 Common Issues

### Issue: Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in server/.env
PORT=5001
```

### Issue: MongoDB connection failed
- Check if MongoDB is running: `mongod`
- Or use MongoDB Atlas connection string

### Issue: CORS errors
- Verify `CLIENT_URL` in server/.env matches frontend URL
- Should be `http://localhost:5173` for development

### Issue: Socket not connecting
- Check browser console for errors
- Verify backend is running on port 5000
- Check `VITE_API_URL` in client/.env

## 🎨 Project Structure

```
PulseChat/
├── server/           # Backend (Node.js + Express)
│   ├── controllers/  # Business logic
│   ├── models/       # Database schemas
│   ├── routes/       # API routes
│   ├── sockets/      # WebSocket handlers
│   ├── middleware/   # Auth & validation
│   ├── utils/        # Helpers (JWT, AI, Cloudinary)
│   └── server.js     # Entry point
│
├── client/           # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/    # Login, Register, Dashboard, Analytics
│   │   ├── context/  # AuthContext, ChatContext
│   │   ├── services/ # API client
│   │   └── utils/    # Socket client
│   └── index.html
│
└── README.md
```

## 📚 Documentation

- **Full README**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Project Summary**: See `PROJECT_SUMMARY.md`

## 🎉 You're Ready!

Start coding, testing, and deploying your production-ready chat application!

Need help? Check the documentation files or open an issue.

