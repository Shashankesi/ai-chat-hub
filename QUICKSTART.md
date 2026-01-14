# PulseChat - Quick Start Guide 🚀

## ✅ Current Status

**Backend Server:** Running on http://localhost:5000
**Frontend App:** Running on http://localhost:5174

## 🎯 Access Your Application

Open your browser and go to:
**http://localhost:5174**

## 📝 MongoDB Setup (Required)

The application needs MongoDB to store data. Here are your options:

### Option 1: Install MongoDB Locally (Recommended for Development)

```bash
# On Ubuntu/Debian
sudo apt-get install -y mongodb-org

# On Mac
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod    # Linux
brew services start mongodb     # Mac
```

### Option 2: Use MongoDB Atlas (Cloud - Free Tier Available)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster
4. Get connection string
5. Update `/home/daytona/codebase/server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulsechat
   ```
6. Restart server: `npm start`

### Option 3: Run MongoDB in Docker

```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name pulsechat-mongo mongo:latest

# Restart backend server
cd /home/daytona/codebase/server
npm start
```

## 🔑 Enable AI Features (Optional)

To enable AI smart replies, summarization, and other AI features:

1. Get OpenAI API Key from https://platform.openai.com
2. Update `/home/daytona/codebase/server/.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Restart server

Without OpenAI key, the app works but AI features show demo responses.

## 📸 Enable Media Uploads (Optional)

To enable image/video uploads:

1. Sign up at https://cloudinary.com (free account)
2. Get your credentials from Dashboard
3. Update `/home/daytona/codebase/server/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart server

## 🧪 Test the Application

1. Go to http://localhost:5174
2. Click "Sign up"
3. Create an account with any email (e.g., test@example.com)
4. Start chatting!

## 🐛 Troubleshooting

### Frontend not loading?
Check if it's running:
```bash
curl http://localhost:5174
```

If not, restart:
```bash
cd /home/daytona/codebase/client
npm run dev
```

### Backend not responding?
Check if it's running:
```bash
curl http://localhost:5000/api/auth/me
```

If not, restart:
```bash
cd /home/daytona/codebase/server
npm start
```

### Can't create account?
This means MongoDB is not connected. Follow the MongoDB setup steps above.

## 📊 View Logs

Backend logs:
```bash
tail -f /tmp/claude/-home-daytona-codebase/tasks/ba59ba4.output
```

Frontend logs:
```bash
tail -f /tmp/claude/-home-daytona-codebase/tasks/b2657cf.output
```

## 🎉 You're All Set!

Once MongoDB is connected, you can:
- Create accounts and chat in real-time
- Test all messaging features
- View analytics dashboard
- Try focus mode and privacy settings
- Search through messages

For full documentation, see:
- README.md - Complete project overview
- FEATURES.md - All 100+ features
- SETUP_GUIDE.md - Detailed setup instructions

