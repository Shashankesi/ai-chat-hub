# PulseChat Deployment Guide

## Prerequisites
1. MongoDB Atlas account
2. Cloudinary account  
3. OpenAI API key
4. Render account (backend)
5. Vercel account (frontend)

## Step 1: MongoDB Atlas Setup
1. Go to mongodb.com/atlas
2. Create a new cluster (free tier)
3. Create database user with password
4. Add IP whitelist: 0.0.0.0/0 (all IPs)
5. Get connection string

## Step 2: Backend Deployment (Render)
1. Push code to GitHub
2. Go to render.com
3. New > Web Service
4. Connect repository
5. Configure:
   - Name: pulsechat-api
   - Root Directory: server
   - Build Command: npm install
   - Start Command: npm start
6. Add environment variables:
   - MONGODB_URI=<your-atlas-connection-string>
   - JWT_SECRET=<generate-random-string>
   - JWT_REFRESH_SECRET=<generate-random-string>
   - OPENAI_API_KEY=<your-openai-key>
   - CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   - CLOUDINARY_API_KEY=<your-api-key>
   - CLOUDINARY_API_SECRET=<your-api-secret>
   - NODE_ENV=production
   - CLIENT_URL=<will-add-after-frontend-deploy>
7. Deploy
8. Copy the deployed URL (e.g. https://pulsechat-api.onrender.com)

## Step 3: Frontend Deployment (Vercel)
1. Go to vercel.com
2. Import your GitHub repository
3. Configure:
   - Root Directory: client
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: dist
4. Add environment variable:
   - VITE_API_URL=<your-render-backend-url>
5. Deploy
6. Copy deployed URL

## Step 4: Update Backend with Frontend URL
1. Go back to Render
2. Add environment variable:
   - CLIENT_URL=<your-vercel-frontend-url>
3. Redeploy

## Testing
1. Visit your Vercel URL
2. Register a new account
3. Test messaging features
4. Check browser console for errors

## Troubleshooting

### CORS Errors
- Ensure CLIENT_URL in backend matches frontend URL exactly
- Check if both services are using HTTPS

### Socket Connection Fails
- Verify backend URL in frontend .env
- Check Render logs for errors

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist includes 0.0.0.0/0

## Custom Domain (Optional)
1. In Vercel: Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update CLIENT_URL in backend

## Monitoring
- Render: Check logs in dashboard
- Vercel: Check deployment logs
- MongoDB Atlas: Monitor database metrics

