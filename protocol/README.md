# TruMarket on-chain protocol

Solidity contracts for on-chain deal registry and per-deal USDC vault bookkeeping. **Milestones and supplier payments live off-chain** (API / MongoDB). **EVM-compatible** — deployable on Base, Arc, and other EVM chains without language changes.

## Architecture (v2.0 — Lagoon liquidity pool)

Since v2.0, **investor capital no longer flows through per-deal `DealVault` contracts**. Deposits go into a shared **TruMarket Liquidity Pool** built on [Lagoon](https://lagoon.finance/) vaults (separate repo: `trumarket-finance-with-safe`). TruMarket admins allocate pool capital to deals; investors earn average pool APY.

These contracts remain on-chain for **deal identity (ERC-721), borrower repayment, and vault bookkeeping** — not for routing live investor deposits or milestone-gated payouts.

```
┌─────────────────────────────────────────────────────────────────┐
│  Lagoon liquidity pool (Base / Arc — external to this package)  │
│  Investor USDC in → admin allocation → deal funding (off-chain) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DealsManager (ERC-721)                                         │
│  • mint(maxDeposit, borrower) — register deal NFT + DealVault    │
│  • donateToDeal() — borrower repays USDC into vault             │
│  • setDealCompleted() — mark deal complete; unpause if repaid   │
│  • transferFromVault() — admin vault transfer                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ owns
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  DealVault (ERC-4626, one per deal)                             │
│  ACTIVE: transferToBorrower, donate, complete                   │
│  LEGACY: deposit / redeem (v1.x investor path — read-only UI)   │
└─────────────────────────────────────────────────────────────────┘
```

### What each contract does

| Contract | Role in v2.0 | Status |
|----------|--------------|--------|
| **DealsManager** | Deal NFT registry; borrower `donateToDeal`; admin ops | **Active** — API mints deals on create |
| **DealVaultFactory** | Deploys per-deal vaults (keeps `DealsManager` under 24KB) | **Active** — one deploy per network |
| **DealVault** | Per-deal USDC bookkeeping; borrower repayment; admin transfer | **Active** for repay flows; **not** the investor deposit rail |
| **ERC20Mock** | Local/test USDC stand-in | **Test only** |

### Planned (Circle grant / Arc)

- Deploy `DealsManager` on **Arc testnet** (EVM-compatible; add Arc RPC to `hardhat.config.ts`).
- **Circle CCTP / Bridge Kit** for cross-chain USDC into the Lagoon pool (investor app, not these contracts).
- Full removal of per-deal vault investor paths once Lagoon pool is the sole capital source.

## Contract details

### DealsManager (`TruMarketDeals` / `TMD`)

- **Owner-only** `mint(maxDeposit, borrower)` — creates ERC-721 token, deploys a `DealVault` via `DealVaultFactory`, and pauses/blocks direct vault deposits.
- **`donateToDeal`** — borrower repays USDC into the deal vault (shipment finance UI).
- **`setDealCompleted`** — marks deal complete; calls `vault.complete()` when repayment exceeds `maxDeposit`.
- **`reopenVault`** — admin-only legacy helper to re-enable direct vault deposits (v1.x tests).
- **`transferFromVault`** — admin emergency transfer from vault.

### DealVault (`Deal Shares` / `DLS`)

- ERC-4626 vault with inflation-attack protection (`_decimalsOffset = 6`, min deposit 1e6).
- **v1.x path (legacy):** `deposit` / `mint` / `redeem` / `withdraw` — investors funded deals directly. Still callable on-chain but **not used** for live v2.0 investor flows.
- **v2.0 path:** `transferToBorrower` (admin via `transferFromVault`), `donate` (borrower repay), `complete` (unpause when assets exceed cap).

Underlying token: **USDC** (6 decimals on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`).

## Development

```bash
cd protocol
npm install
npm test                    # Hardhat tests
npm run local:node          # local chain
npm run local:deploy        # deploy DealsManager + mock USDC
```

### Networks (`hardhat.config.ts`)

| Network | Use |
|---------|-----|
| `hardhat` | Local dev; optional Base fork |
| `base` | Production deployment |
| `sepolia` / `amoy` | Testnets |
| `arcTestnet` | **Circle grant** — deploy DealsManager, CCTP destination |

Deploy and bridge commands:

```bash
npm run deploy:arc          # DealsManager on Arc testnet
npm run bridge:arc -- Base_Sepolia 1.00   # CCTP USDC → Arc
```

See [`docs/DEPLOY-ARC.md`](docs/DEPLOY-ARC.md) and [`docs/CIRCLE-GRANT-SMART-CONTRACT-FLOW.md`](docs/CIRCLE-GRANT-SMART-CONTRACT-FLOW.md).

## Integration surfaces

| Consumer | Uses |
|----------|------|
| `api/src/deals/deals.service.ts` | On create/confirm: `applyMintAndVaultIfEnabled()` → `mintNFT` when `AUTOMATIC_DEALS_ACCEPTANCE=true` |
| `api/src/blockchain/` | `mintNFT`, `setDealAsCompleted`, `vault` |
| `api/src/cctp/` | `GET /cctp/config` — Bridge Kit routes for web |
| Finance app `/treasury` | Ops-only CCTP bridge (Bridge Kit) |
| `web/.../ShipmentFinance.tsx` | Borrower `donateToDeal` on completed deals |
| `deploy-sc/` | Base deploy and vault utilities |

See [`docs/CIRCLE-GRANT-SMART-CONTRACT-FLOW.md`](docs/CIRCLE-GRANT-SMART-CONTRACT-FLOW.md) for grant milestone mapping and full product ↔ contract flow.

ABI copies live in `api/`, `web/`, and `deploy-sc/` — regenerate from `npx hardhat compile` when contracts change.

## Security

v1.1.0 audit fixes (C-01, C-02, H-02, M-01, L-01, L-10) are in `CHANGELOG.md`. Tests cover reentrancy, inflation attacks, milestone math, and borrower changes.
