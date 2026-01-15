# WandryFi 🌍✈️

> **Travel-to-Earn dApp** - Stake TMON tokens to prove on-ground arrival and earn rewards!

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://docs.soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange)](https://book.getfoundry.sh/)
[![Monad](https://img.shields.io/badge/Network-Monad%20Testnet-purple)](https://docs.monad.xyz)

## 🚀 Deployed Contract

| Network | Contract Address |
|---------|------------------|
| **Monad Testnet** | `0x022121411877937ac908A7E73B4C6f3115A0ACCE` |

## 📖 Overview

WandryFi is a travel-to-earn platform where users:
1. **Stake** TMON tokens with a travel destination commitment
2. **Travel** to the destination on the specified date
3. **Check-in** with a verified signature to prove arrival
4. **Earn** rewards from the destination pool + receive a Journey NFT

### Key Features
- 🎯 **Destination Pools** - Each location has its own reward pool
- 🏆 **Place Value Multipliers** - Harder destinations earn higher rewards
- 🖼️ **Journey NFTs** - Commemorative NFTs minted on successful check-ins
- 📊 **Leaderboard** - Track top travelers by profit earned
- ⏰ **Claim Window** - 24-hour window to claim rewards after travel date

### Contract Parameters
| Parameter | Value |
|-----------|-------|
| Base Reward | 0.002 TMON |
| Platform Fee | 4% (max 5%) |
| Min Stake Duration | 15 days |
| Claim Window | 1 day |

## 🛠️ Development

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

### Installation

```bash
git clone https://github.com/your-repo/WandryFi.git
cd WandryFi
forge install
```

### Build

```bash
forge build
```

### Test

```bash
forge test -vv
```

### Format

```bash
forge fmt
```

## 🚀 Deployment

### Environment Setup

Create a `.env` file:
```env
PRIVATE_KEY=0x_your_private_key
VERIFIER_ADDRESS=your_verifier_wallet
TREASURY_ADDRESS=your_treasury_wallet
PLATFORM_FEE_PERCENT=4
RPC_URL_MONAD_TESTNET=https://testnet-rpc.monad.xyz
```

### Deploy to Monad Testnet

```bash
source .env && forge script script/Deploy.s.sol:DeployWandryFi \
  --rpc-url $RPC_URL_MONAD_TESTNET \
  --broadcast -vvvv
```

### Post-Deployment Setup

1. **Configure Destinations:**
```bash
source .env && forge script script/Setup.s.sol:SetupWandryFi \
  --rpc-url $RPC_URL_MONAD_TESTNET \
  --broadcast
```

2. **Seed Reward Pools:**
```bash
source .env && forge script script/SeedPools.s.sol:SeedPools \
  --rpc-url $RPC_URL_MONAD_TESTNET \
  --broadcast
```

### Verify Contract

```bash
forge verify-contract \
  0x022121411877937ac908A7E73B4C6f3115A0ACCE \
  src/WandryFi.sol:WandryFi \
  --chain 10143 \
  --verifier sourcify \
  --verifier-url https://sourcify-api-monad.blockvision.org \
  --constructor-args $(cast abi-encode "constructor(address,address,uint256)" $VERIFIER_ADDRESS $TREASURY_ADDRESS 4)
```

## 📁 Project Structure

```
├── src/
│   └── WandryFi.sol      # Main contract
├── script/
│   ├── Deploy.s.sol      # Deployment script
│   ├── Setup.s.sol       # Destination configuration
│   └── SeedPools.s.sol   # Pool seeding script
├── test/
│   └── WandryFi.t.sol    # Test suite (23 tests)
└── foundry.toml          # Foundry configuration
```

## 📜 Contract Functions

### User Functions
| Function | Description |
|----------|-------------|
| `stake(destinationId, travelDate)` | Stake TMON for a travel commitment |
| `checkIn(signature)` | Claim rewards with verified arrival proof |
| `processFailure()` | Cancel expired commitment |

### View Functions
| Function | Description |
|----------|-------------|
| `getUserCommitment(user)` | Get user's active commitment |
| `getPoolBalance(destinationId)` | Check destination pool balance |
| `getLeaderboard()` | Get all users and their profits |
| `getUserJourneyNFTs(user)` | Get user's Journey NFT IDs |

### Admin Functions
| Function | Description |
|----------|-------------|
| `seedPool(destinationId)` | Add funds to destination pool |
| `setDestinationName(id, name)` | Set destination display name |
| `setPlaceValue(id, value)` | Set reward multiplier |
| `pause() / unpause()` | Emergency controls |

## 📚 Resources

- [Monad Documentation](https://docs.monad.xyz)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## 📄 License

MIT