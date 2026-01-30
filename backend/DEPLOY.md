# WandryFi Backend Deployment Guide

## 🚀 Deploy to Render

### Step 1: Push Backend to GitHub
Make sure the backend folder is in your repository.

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `wandryfi-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | Free (or paid for better uptime) |

### Step 3: Add Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
VERIFIER_PRIVATE_KEY=your_private_key_here
API_KEY=487963
PORT=3001
```

⚠️ **IMPORTANT**: Use the same `VERIFIER_PRIVATE_KEY` that corresponds to the verifier address registered in your smart contract!

### Step 4: Deploy
Click **"Create Web Service"** and wait for deployment.

### Step 5: Note Your Backend URL
After deployment, Render will give you a URL like:
```
https://wandryfi-backend.onrender.com
```

---

## 🔄 Keep-Alive GitHub Action

The free tier on Render sleeps after 15 minutes of inactivity. We've added a GitHub Action to ping the backend every 14 minutes.

### Setup:

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add:
   - **Name**: `BACKEND_URL`
   - **Value**: `https://your-backend-url.onrender.com` (without trailing slash)

4. The workflow will automatically run every 14 minutes!

---

## 🔧 Local Development

```bash
cd backend
npm install
npm run dev
```

Server runs at `http://localhost:3001`

### API Endpoints:
- `GET /api` - Health check
- `POST /api/verify` - Location verification
