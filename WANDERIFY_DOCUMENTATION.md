# Wanderify — From On-Chain to On-Ground

> **Travel-to-Earn dApp** — Transform journeys into verifiable, rewarding on-chain adventures.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://docs.soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange)](https://book.getfoundry.sh/)
[![Monad](https://img.shields.io/badge/Network-Monad%20Testnet-purple)](https://docs.monad.xyz)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org/)

---

## 1. Introduction

**Wanderify** is a travel-to-earn Web3 dApp that transforms journeys into verifiable, rewarding on-chain adventures.

**The Twist?** Your travel is not just a memory — it's a transaction. You stake before you go, prove arrival with GPS, and watch your footsteps animate on a navigation map as you close in on the reward zone.

### Deployed Contract

| Network | Contract Address |
|---------|------------------|
| **Monad Testnet** | `0x022121411877937ac908A7E73B4C6f3115A0ACCE` |

---

## 2. The Core Problem

| Problem | Reality |
|---------|---------|
| **No Verifiable Travel** | Travel today = photos and posts, but nothing verifiable or valuable on-chain |
| **Weak Sustainability** | Existing "travel-to-earn" apps are ideas or early-stage projects with weak tokenomics |
| **Missing Link** | No protocol connecting on-chain intent with on-ground proof of arrival |

---

## 3. Wanderify's Solution

Wanderify solves this with a mix of **stake-first economics** + **gamified proof-of-travel**:

### 3.1 Core Mechanics

| Mechanic | Implementation |
|----------|----------------|
| **Place Value (0–100)** | Difficulty score for each destination. Multiplier stored in `placeValues[destinationId]`. Higher difficulty = higher rewards. |
| **15-Day Stake Commitment** | `MIN_STAKE_DURATION = 15 days` — Travelers must lock stake before the trip, proving genuine intent. |
| **Claim Window** | `CLAIM_WINDOW = 1 day` — Users have 24 hours from travel date to claim rewards. |

### 3.2 Circular Pool Economy

```
┌─────────────────────────────────────────────────────────────────┐
│                    CIRCULAR POOL SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   STAKE                    DESTINATION POOL                      │
│   ┌────┐                   ┌──────────────┐                     │
│   │User│ ──────96%────────▶│  Location    │                     │
│   │TMON│                   │   Pool       │                     │
│   └────┘                   └──────────────┘                     │
│      │                           │                               │
│      │ 4%                        │                               │
│      ▼                           │                               │
│   ┌─────────┐                    │                               │
│   │Treasury │                    │                               │
│   │  Fees   │                    │                               │
│   └─────────┘                    │                               │
│                                  │                               │
│   ┌─────────────────────────────┴────────────────────────────┐  │
│   │                    OUTCOME                                │  │
│   ├─────────────────────┬────────────────────────────────────┤  │
│   │  ✅ SUCCESS         │  ❌ FAILURE                         │  │
│   │  ────────────       │  ────────                          │  │
│   │  Stake returned +   │  Stake remains in pool             │  │
│   │  Pool emission      │  → Grows rewards for others        │  │
│   │  + Journey NFT      │                                    │  │
│   └─────────────────────┴────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Animated Navigation Map

As you near your chosen destination, the app switches to **XP Mode**:

- **Real-Time GPS Tracking** — Uses Leaflet maps with `watchPosition()` for continuous location updates
- **Glowing Path Visualization** — Cyan polyline connects user to destination
- **Distance Zones**:
  - 🔴 **FAR** (>500m) — Red zone, navigate to target
  - 🔵 **NEAR** (≤500m) — Blue zone, approaching
  - 🟡 **CLOSE** (≤100m) — Orange zone, almost there
  - ✅ **READY** (≤50m) — Green zone, check-in available
- **Pulsing Reward Radius** — 50m check-in zone pulses when entered

---

## 4. Technical Architecture

### 4.1 Smart Contract (`WandryFi.sol`)

**Contract Type**: ERC721 + ReentrancyGuard + Pausable + Ownable

```solidity
// Core Constants
uint256 public constant MIN_STAKE_DURATION = 15 days;
uint256 public constant BASE_REWARD = 2000000000000000; // 0.002 TMON
uint256 public constant BETA = 50; // 0.5 scaled by 100
uint256 public constant CLAIM_WINDOW = 1 days;
```

**Key Data Structures**:

```solidity
struct Commitment {
    address user;
    uint256 amountInPool;      // Stake after fee deduction
    uint256 travelDate;        // Unix timestamp
    uint256 destinationId;     // Destination ID (1-8)
    bool isProcessed;          // Completion status
}

struct JourneyNFT {
    uint256 destinationId;
    uint256 completionDate;
    uint256 stakedAmount;
    uint256 rewardEarned;
    string destinationName;
}
```

### 4.2 Backend Verification Service

**Technology**: Node.js + Express + Ethers.js

**Verification Pipeline**:

```
┌─────────────────────────────────────────────────────────────────┐
│                  VERIFICATION PIPELINE                           │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │  API Key Validation   │
               │  (x-api-key header)   │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │   IP Geolocation      │
               │   Country Match       │
               │   (ip-api.com)        │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │  VPN/Proxy Detection  │
               │   Block if detected   │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │   GPS Distance Check  │
               │   Haversine Formula   │
               │   Must be ≤ 50m       │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │  Generate Signature   │
               │  keccak256(address,   │
               │  destinationId)       │
               └───────────────────────┘
```

### 4.3 Frontend (Next.js + Wagmi)

**Key Components**:

| Component | Purpose |
|-----------|---------|
| `explore-page.tsx` | Browse destinations with pool info & difficulty |
| `staking-modal.tsx` | Stake TMON with date picker |
| `navigation-view.tsx` | Real-time GPS navigation with Leaflet maps |
| `my-travel-page.tsx` | Track active quests & NFT collection |
| `leaderboard-page.tsx` | View top travelers by profit |

---

## 5. User Journey

### Phase 1: Choose a Place

Browse the interactive map showing:
- **Place Value** — Difficulty multiplier
- **Pool Size** — Current reward pool balance
- **Destination Details** — Coordinates, description, requirements

### Phase 2: Stake Your Intent

```
┌─────────────────────────────────────────┐
│         STAKING BREAKDOWN               │
├─────────────────────────────────────────┤
│  Your Stake:        1.0 TMON            │
│  ────────────────────────────────       │
│  Platform Fee (4%): 0.04 TMON → Treasury│
│  Pool Deposit:      0.96 TMON → Pool    │
├─────────────────────────────────────────┤
│  Travel Date:       Selected by user    │
│  Claim Window:      Travel Date + 1 day │
└─────────────────────────────────────────┘
```

**Recorded on-chain as commitment contract:**
```solidity
commitments[msg.sender] = Commitment({
    user: msg.sender,
    amountInPool: poolAmount,  // stake - fee
    travelDate: _travelDate,
    destinationId: _destinationId,
    isProcessed: false
});
```

### Phase 3: Travel & Approach

The animated navigation map guides you:

1. **Map Centers** — Auto-adjusts to show both user and destination
2. **User Avatar** — Animated marker with direction indicator
3. **Path Line** — Cyan line showing direct route
4. **Distance Display** — Real-time distance in meters/km
5. **Progress Bar** — Visual progress toward destination

### Phase 4: Check-In & Prove

```
┌─────────────────────────────────────────────────────────────────┐
│                   CHECK-IN PROCESS                               │
└─────────────────────────────────────────────────────────────────┘

  User Location          Backend                  Smart Contract
       │                    │                           │
       │ GPS Coordinates    │                           │
       │───────────────────▶│                           │
       │                    │                           │
       │                    │ Verify:                   │
       │                    │ - IP geolocation         │
       │                    │ - No VPN/Proxy           │
       │                    │ - Distance ≤ 50m         │
       │                    │                           │
       │                    │ Sign Message              │
       │    Signature       │                           │
       │◀───────────────────│                           │
       │                    │                           │
       │ checkIn(signature) │                           │
       │────────────────────│──────────────────────────▶│
       │                    │                           │
       │                    │           Verify Signer   │
       │                    │           Calculate Reward│
       │                    │           Mint NFT        │
       │                    │           Transfer Payout │
       │                    │                           │
       │   Payout + NFT     │                           │
       │◀───────────────────│───────────────────────────│
```

### Phase 5: Rewards

**Success Formula**:

```
E = min(BaseReward × (1 + β × PlaceValue / 100), Pool × 10%)

Where:
  BaseReward = 0.002 TMON
  β = 50 (0.5 scaled)
  PlaceValue = Destination difficulty (0-100)
  Pool = Current destination pool balance
  
Total Payout = AmountInPool + E
```

**Example Calculation**:
```
Stake: 1.0 TMON
Platform Fee: 0.04 TMON (4%)
AmountInPool: 0.96 TMON
PlaceValue: 80 (Everest Base Camp)
Pool Balance: 5.0 TMON

PlaceValueBonus = 0.002 × (100 + 50 × 80) / 100
                = 0.002 × (100 + 4000) / 100
                = 0.002 × 41
                = 0.082 TMON

PoolCap = 5.0 × 10% = 0.5 TMON

Emission = min(0.082, 0.5) = 0.082 TMON

Total Payout = 0.96 + 0.082 = 1.042 TMON
Profit = 1.042 - 1.0 = 0.042 TMON (4.2% gain!)
```

---

## 6. Available Destinations

| ID | Destination | Country | Place Value | Difficulty |
|----|-------------|---------|-------------|------------|
| 1 | Everest Base Camp | Nepal | 80 | Legendary |
| 2 | Chadar Trek, Zanskar | India | 70 | Epic |
| 3 | Hemkund Sahib & Valley of Flowers | India | 60 | Hard |
| 4 | Key Monastery, Spiti | India | 50 | Hard |
| 5 | Havelock Island Circuit | India | 40 | Medium |
| 6 | Jaisalmer Fort & Sam Dunes | India | 30 | Medium |
| 7 | IIIT Dharwad Campus | India | 20 | Easy |
| 8 | LNMIIT Jaipur Campus | India | 20 | Easy |

---

## 7. What Makes Wanderify Unique

### 7.1 On-Chain → On-Ground Proof

| Feature | Implementation |
|---------|----------------|
| **GPS Validation** | Haversine formula calculates distance, 50m radius check |
| **IP Geolocation** | Country code must match destination country |
| **Anti-Fraud** | VPN/Proxy detection blocks spoofing attempts |
| **Signature Verification** | ECDSA signatures from trusted verifier |

### 7.2 Circular Pool Economics

- **Failures fuel winners** — Unclaimed stakes remain in pool
- **Pool cap protection** — Max 10% emission per win prevents draining
- **Growing rewards** — More failures = larger emission opportunities

### 7.3 Stake-First Design

- **15-day minimum lock** — Ensures genuine travel intent
- **24-hour claim window** — Must claim on travel date or day after
- **Single active commitment** — One quest at a time per wallet

### 7.4 Gamified UX

| Element | Description |
|---------|-------------|
| **Navigation Map** | RPG-style animated map with avatar movement |
| **Distance Zones** | Color-coded proximity indicators |
| **XP Rewards** | Displayed as gaming-style point gains |
| **Journey NFTs** | ERC721 proof of completed adventures |
| **Leaderboard** | Profit-based ranking of travelers |

---

## 8. Why Monad + Wanderify

| Monad Strength | Wanderify Benefit |
|----------------|-------------------|
| **10K TPS** | Handle global user base |
| **1s Finality** | Instant stake confirmation & check-ins |
| **Ultra-low Gas** | Affordable microtransactions |
| **EVM Compatible** | Standard Solidity development |

> *"Every step becomes a transaction. Every arrival becomes a reward."*

---

## 9. Technical Specifications

### Contract Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `BASE_REWARD` | 0.002 TMON | Minimum emission per check-in |
| `BETA` | 50 | Place value multiplier (0.5 scaled) |
| `platformFeePercent` | 4% | Fee sent to treasury (max 5%) |
| `MIN_STAKE_DURATION` | 15 days | Minimum stake lock period |
| `CLAIM_WINDOW` | 1 day | Time to claim after travel date |

### Contract Functions

#### User Functions
| Function | Description |
|----------|-------------|
| `stake(destinationId, travelDate)` | Lock TMON with travel commitment |
| `checkIn(signature)` | Verify arrival & claim rewards |
| `processFailure()` | Cancel expired commitment |

#### View Functions
| Function | Description |
|----------|-------------|
| `getUserCommitment(user)` | Get user's active commitment |
| `getPoolBalance(destinationId)` | Check destination pool balance |
| `getLeaderboard()` | Get all users and their profits |
| `getUserJourneyNFTs(user)` | Get user's Journey NFT IDs |
| `getJourneyNFTDetails(tokenId)` | Get NFT metadata |

#### Admin Functions
| Function | Description |
|----------|-------------|
| `seedPool(destinationId)` | Add funds to destination pool |
| `setDestinationName(id, name)` | Set destination display name |
| `setPlaceValue(id, value)` | Set reward multiplier |
| `pause() / unpause()` | Emergency controls |

---

## 10. Future Vision

| Phase | Features |
|-------|----------|
| **Phase 1** | ✅ Core staking & check-in system |
| **Phase 2** | Photo proof integration for extra XP |
| **Phase 3** | Global leaderboards + streak rewards |
| **Phase 4** | One-click reinvest into new quests |
| **Phase 5** | Cross-border & international destinations |
| **Phase 6** | Mobile app with AR navigation |

---

## 🌟 Conclusion

**Wanderify** is the first protocol that transforms on-chain intent into on-ground proof using a fair, circular pool economy.

The animated navigation map gives Wanderify a **unique, demo-ready visual identity**, while Monad's speed and scalability make the experience **seamless**.

Wanderify isn't just a travel app — it's a **movement economy** where footsteps turn into verifiable, rewarding digital milestones.

---

## 📚 Resources

- [Monad Documentation](https://docs.monad.xyz)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Wagmi Documentation](https://wagmi.sh)
- [Leaflet Maps](https://leafletjs.com)

## 📄 License

MIT
