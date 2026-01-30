# WandryFi Frontend Deployment Guide

## 🚀 Deploy to Vercel

### Step 1: Install Vercel CLI (optional)
```bash
npm i -g vercel
```

### Step 2: Push to GitHub
Make sure your repository is on GitHub.

### Step 3: Connect to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `client-v2` |
| **Build Command** | `pnpm build` (or `npm run build`) |
| **Output Directory** | `.next` |
| **Install Command** | `pnpm install` (or `npm install`) |

#### Option B: Via CLI
```bash
cd client-v2
vercel
```

### Step 4: Add Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_RPC_URL=https://rpc.ankr.com/monad_testnet
NEXT_PUBLIC_API_KEY=487963
NEXT_PUBLIC_CONTRACT_ADDRESS=0x26c5FeC3C293D2b755ab5ce60BbE231671f1eeD0
```

### Step 5: Update Backend URL

After deploying the backend to Render, update the frontend to use the production backend URL.

Edit `client-v2/components/navigation-view.tsx`:

Find:
```javascript
const response = await fetch("http://localhost:3001/api/verify", {
```

Replace with:
```javascript
const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/verify", {
```

Then add to Vercel environment variables:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

### Step 6: Deploy
Click **"Deploy"** and wait for the build to complete.

---

## 🔧 Local Development

```bash
cd client-v2
pnpm install
pnpm dev
```

Frontend runs at `http://localhost:3000`

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Backend `BACKEND_URL` secret added to GitHub
- [ ] Keep-alive workflow enabled
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on Vercel
- [ ] Backend URL updated in frontend code
- [ ] Test location verification flow
- [ ] Test wallet connection
- [ ] Test staking flow
