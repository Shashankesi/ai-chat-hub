# PulseChat - AI-Enhanced Real-Time Chat Application

<div align="center">

![PulseChat Logo](https://img.shields.io/badge/PulseChat-AI--Powered-blue?style=for-the-badge)
[![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)](https://www.mongodb.com/mern-stack)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-black?style=for-the-badge)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**An intelligent, privacy-first real-time chat application that goes beyond WhatsApp**

</div>

---

## 🎯 What Makes PulseChat Unique?

PulseChat is not just another chat app - it's an **AI-enhanced productivity tool** with advanced privacy controls and focus-oriented features that WhatsApp doesn't offer:

✨ **AI Message Intelligence** - Smart replies, auto-summarization, and intent detection
🔒 **Advanced Privacy Controls** - Selective visibility, read receipt management
📌 **Message Productivity** - Pin important messages, convert to tasks/notes
🎯 **Focus Mode** - Distraction-free messaging with auto-replies
📊 **Chat Analytics** - Track messaging patterns and productivity
🔍 **Global Search** - Find any message across all conversations
🎙️ **Voice-to-Text** - Convert voice messages to searchable text
⏳ **Message Expiry** - Auto-delete sensitive messages

---

## 🛠️ Tech Stack

### Frontend
- React.js, Tailwind CSS, Context API
- Socket.io Client, Framer Motion
- Recharts, Axios, React Router

### Backend
- Node.js, Express.js, Socket.io
- MongoDB, Mongoose, JWT
- Bcrypt, Multer

### Cloud & AI
- Cloudinary (media), OpenAI GPT (AI)
- MongoDB Atlas (database)

### Deployment
- Vercel (frontend), Render (backend)

---

## 💻 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- OpenAI API Key
- Cloudinary Account

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/pulsechat.git
cd pulsechat
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pulsechat
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
OPENAI_API_KEY=your_openai_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

Start server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🌍 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import repo on Vercel
3. Set `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

### Backend (Render)
1. Create Web Service on Render
2. Connect GitHub repo
3. Add all environment variables
4. Deploy

---

## 🎯 Resume Description

> Built a production-ready, full-stack real-time chat application using MERN stack (MongoDB, Express.js, React, Node.js) with Socket.io for WebSocket communication. Integrated OpenAI GPT for intelligent message features including auto-summarization, smart reply suggestions, and intent detection. Implemented advanced privacy controls, focus mode, JWT authentication, file uploads (Cloudinary), and a comprehensive analytics dashboard with Recharts visualization. Deployed on Vercel (frontend) and Render (backend) with MongoDB Atlas.

**Key Technologies**: React, Node.js, Express, MongoDB, Socket.io, JWT, OpenAI API, Cloudinary, Tailwind CSS

---

## 📝 License

MIT License - see LICENSE file

---

<div align="center">

**Made with ❤️**

⭐ Star this repo if you find it helpful!

</div>
