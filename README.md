# 🌍 WandryFi - Travel-to-Earn on Monad

<p align="center">
  <strong>Explore. Own. Earn.</strong><br>
  The first travel-to-earn protocol on Monad. Stake on destinations, verify your journey with GPS, and earn rewards.
</p>

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (for frontend)
- npm (for backend)
- A wallet with Monad testnet tokens

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/WandryFi.git
cd WandryFi

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your VERIFIER_PRIVATE_KEY

# Frontend
cd ../client-v2
pnpm install
cp .env.example .env
```

### 2. Run Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd client-v2
pnpm dev
# Runs on http://localhost:3000
```

---

## 📁 Project Structure

```
WandryFi/
├── backend/                 # Express.js verification server
│   ├── index.js            # Main server file
│   ├── .env.example        # Environment template
│   └── DEPLOY.md           # Backend deployment guide
├── client-v2/              # Next.js frontend
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   ├── lib/                # Utilities & configs
│   ├── .env.example        # Environment template
│   └── DEPLOY.md           # Frontend deployment guide
├── Smart_contract_wandryfi/ # Foundry smart contracts
│   ├── src/                # Solidity contracts
│   ├── script/             # Deployment scripts
│   └── test/               # Contract tests
└── .github/
    └── workflows/
        └── keep-alive.yml  # Ping backend to prevent sleep
```

---

## 🌐 Deployment

### Deploy Backend (Render)
See [backend/DEPLOY.md](./backend/DEPLOY.md)

### Deploy Frontend (Vercel)
See [client-v2/DEPLOY.md](./client-v2/DEPLOY.md)

### Keep-Alive Workflow
The GitHub Action in `.github/workflows/keep-alive.yml` pings the backend every 14 minutes to prevent Render's free tier from sleeping.

**Setup:**
1. Go to GitHub repo → Settings → Secrets → Actions
2. Add secret: `BACKEND_URL` = `https://your-backend.onrender.com`

---

## 🔗 Smart Contract

**Deployed on Monad Testnet:**
- Contract: `0x26c5FeC3C293D2b755ab5ce60BbE231671f1eeD0`
- Chain ID: `10143`
- RPC: `https://rpc.ankr.com/monad_testnet`

---

## 🎮 How It Works

1. **Explore** → Browse destinations on the map
2. **Stake** → Lock TMON tokens on a destination
3. **Travel** → Physically visit the location
4. **Verify** → Check-in with GPS at the destination
5. **Claim** → Get back your stake + bonus rewards + NFT trophy

---

## 📝 Environment Variables

### Backend (`.env`)
| Variable | Description |
|----------|-------------|
| `VERIFIER_PRIVATE_KEY` | Private key for signing verifications |
| `API_KEY` | API authentication key |
| `PORT` | Server port (default: 3001) |

### Frontend (`.env`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_MONAD_CHAIN_ID` | Monad testnet chain ID |
| `NEXT_PUBLIC_MONAD_RPC_URL` | RPC endpoint |
| `NEXT_PUBLIC_API_KEY` | Backend API key |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL (empty for local) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Smart contract address |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, TailwindCSS, wagmi, viem
- **Backend:** Express.js, ethers.js
- **Smart Contracts:** Solidity, Foundry, OpenZeppelin
- **Blockchain:** Monad Testnet

---

## 📜 License

MIT License - See [LICENSE](./LICENSE) for details.
