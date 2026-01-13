# PulseChat - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Prerequisites
Ensure you have installed:
- Node.js v16+ ([Download](https://nodejs.org))
- MongoDB ([Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas)
- Git

### Step 2: Get API Keys

#### OpenAI API Key (for AI features)
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API Keys section
4. Create new key
5. Copy the key (starts with `sk-...`)

#### Cloudinary (for media uploads)
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard
4. Copy: Cloud Name, API Key, API Secret

### Step 3: Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/pulsechat.git
cd pulsechat

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 4: Configure Environment

#### Backend Configuration
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pulsechat
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pulsechat

JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_different_from_above

NODE_ENV=development

# OpenAI (paste your key)
OPENAI_API_KEY=sk-...your-key-here...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### Frontend Configuration
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### Step 5: Start Development Servers

Open 2 terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Should see: `✅ Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Should see: `✅ Local: http://localhost:3000`

### Step 6: Open Application

Go to: **http://localhost:3000**

1. Click "Sign up"
2. Create an account (use any email format)
3. Log in
4. Start chatting!

---

## 🌐 Production Deployment

### Option 1: Vercel (Frontend) + Render (Backend)

#### Deploy Backend to Render

1. **Push to GitHub first**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Go to [Render.com](https://render.com)**
   - Sign up / Log in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `pulsechat` repo

3. **Configure Service**
   - Name: `pulsechat-backend`
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   Click "Advanced" and add all variables from your `.env`:
   ```
   PORT=5000
   MONGO_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<your-secret>
   JWT_REFRESH_SECRET=<your-refresh-secret>
   OPENAI_API_KEY=<your-openai-key>
   CLOUDINARY_CLOUD_NAME=<your-cloud>
   CLOUDINARY_API_KEY=<your-key>
   CLOUDINARY_API_SECRET=<your-secret>
   CLIENT_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://pulsechat-backend.onrender.com`)

#### Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
   - Sign up / Log in with GitHub
   - Click "New Project"
   - Import your `pulsechat` repository

2. **Configure Project**
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variable**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   (Use the Render backend URL from above)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Copy your frontend URL (e.g., `https://pulsechat.vercel.app`)

5. **Update Backend CORS**
   - Go back to Render
   - Update `CLIENT_URL` environment variable to your Vercel URL
   - Restart the service

#### Setup MongoDB Atlas (if not already)

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
   - Sign up / Log in
   - Create free cluster

2. **Configure Database**
   - Click "Connect"
   - Whitelist IP: `0.0.0.0/0` (allow all - for Render)
   - Create database user
   - Copy connection string
   - Replace `<password>` with your password

3. **Update Environment Variables**
   - Update `MONGO_URI` on Render with Atlas connection string

### Option 2: Railway (All-in-One)

1. Go to [Railway.app](https://railway.app)
2. Connect GitHub
3. Deploy both `client` and `server` as separate services
4. Add MongoDB service
5. Configure environment variables
6. Get public URLs

---

## 🧪 Testing the Application

### Test Checklist

#### Authentication
- [ ] Sign up with new account
- [ ] Log in with existing account
- [ ] Logout and log back in
- [ ] Refresh token works (stay logged in)

#### Real-Time Messaging
- [ ] Send text message
- [ ] See message in real-time (open 2 browsers)
- [ ] Typing indicator appears
- [ ] Online/offline status updates
- [ ] Message delivery status (✓ → ✓✓)
- [ ] Read receipts work

#### AI Features
- [ ] Smart replies appear after receiving message
- [ ] Click smart reply to use it
- [ ] Important messages get flagged (use words like "urgent")
- [ ] Conversation summary generates

#### Media & Files
- [ ] Upload image
- [ ] Upload video
- [ ] Image displays in chat
- [ ] File downloads correctly

#### Privacy Controls
- [ ] Change online status visibility
- [ ] Disable read receipts
- [ ] Changes save successfully

#### Focus Mode
- [ ] Activate focus mode
- [ ] Set custom auto-reply
- [ ] Receive auto-reply from focused user
- [ ] Deactivate focus mode

#### Analytics
- [ ] Dashboard loads with data
- [ ] Charts display correctly
- [ ] Productivity score shows
- [ ] Weekly report generates

#### Search
- [ ] Search for keyword in messages
- [ ] Filter by date range
- [ ] Filter by media type
- [ ] Results appear correctly

#### Profile
- [ ] Update name
- [ ] Change avatar
- [ ] Edit bio
- [ ] Changes persist after refresh

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongosh
# Or check MongoDB Atlas connection

# Check .env file exists
cat server/.env

# Check port 5000 is free
lsof -i :5000
# Kill if needed: kill -9 <PID>

# Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start
```bash
# Check .env file
cat client/.env

# Check port 3000 is free
lsof -i :3000

# Clear cache and reinstall
cd client
rm -rf node_modules .vite package-lock.json
npm install
```

### MongoDB Connection Error
```bash
# Local MongoDB
brew services start mongodb-community  # Mac
sudo systemctl start mongod            # Linux

# Or use MongoDB Atlas and update MONGO_URI
```

### OpenAI API Errors
- Check API key is valid
- Ensure you have credits/billing set up
- Check for rate limits
- Use `gpt-3.5-turbo` model (cheaper)

### Socket.io Connection Issues
- Ensure CORS is configured correctly
- Check `CLIENT_URL` in backend .env
- Verify Socket.io client version matches server

### Deployment Issues

**Render:**
- Check build logs for errors
- Ensure environment variables are set
- Verify start command is correct

**Vercel:**
- Check build output
- Ensure `VITE_API_URL` points to Render backend
- Verify root directory is set to `client`

---

## 📚 Additional Resources

### Documentation
- [MongoDB Docs](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Socket.io Docs](https://socket.io/docs/)
- [OpenAI API](https://platform.openai.com/docs)

### Learning Resources
- [MERN Stack Tutorial](https://www.mongodb.com/languages/mern-stack-tutorial)
- [Socket.io Tutorial](https://socket.io/get-started/chat)
- [JWT Authentication](https://jwt.io/introduction)

---

## 💡 Pro Tips

1. **Development:** Use `nodemon` for auto-restart on file changes
2. **Debugging:** Use Chrome DevTools for frontend, VS Code debugger for backend
3. **Testing:** Test with 2 browser windows side-by-side
4. **Performance:** Enable MongoDB indexes for faster queries
5. **Security:** Never commit `.env` files to Git
6. **Scaling:** Use Redis for Socket.io adapter in production
7. **Monitoring:** Set up error tracking (Sentry)
8. **CI/CD:** Add GitHub Actions for automated deployment

---

## 🆘 Need Help?

- Check `PROJECT_SUMMARY.md` for quick reference
- Check `FEATURES.md` for complete feature list
- Review code comments for inline documentation
- Open GitHub issue if you find bugs

---

**Setup Time:** ~5-10 minutes local, ~20-30 minutes production

**Difficulty:** Intermediate

**Support:** Full documentation included

