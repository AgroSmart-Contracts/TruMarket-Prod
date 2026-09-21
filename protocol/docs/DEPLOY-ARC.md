# Deploy TruMarket contracts on Arc (Testnet + Mainnet)

This guide covers deploying **TruMarket-owned** contracts on [Arc](https://docs.arc.io) for the Circle grant. Circle **CCTP** contracts are already deployed on Arc by Circle — you do not deploy those.

---

## Contract inventory

| Contract | Who deploys | Purpose |
|----------|-------------|---------|
| **DealVaultFactory** | **You** (once per network) | Deploys per-deal vaults; keeps `DealsManager` under the 24KB mainnet limit |
| **DealsManager** (`TMD`) | **You** (once per network) | Deal NFT registry; calls `mint()` → factory spawns per-deal vaults |
| **DealVault** (`DLS`) | **DealVaultFactory** (automatic) | One ERC-4626 vault **per deal**, created on `DealsManager.mint()` |
| **USDC** on Arc | **Circle** (native) | `0x3600000000000000000000000000000000000000` — underlying token for vaults |
| **TokenMessengerV2 / MessageTransmitterV2** | **Circle** (CCTP) | Cross-chain burn/mint — used by Bridge Kit, not TruMarket Solidity |
| **ERC20Mock** | **You** (local only) | Hardhat localhost tests — **not** used on Arc |

### What gets deployed when

```
1. You deploy DealVaultFactory                      → one address on Arc
2. You deploy DealsManager(owner, USDC, factory)    → one address on Arc
3. User creates deal in app (AUTOMATIC_DEALS_ACCEPTANCE=true)
4. API calls DealsManager.mint(...)                 → new ERC-721 + new DealVault
```

Each shipment deal = **one new DealVault contract address** (via `DealVaultFactory`).

---

## Network parameters

### Arc Mainnet (Circle grant M2)

| Field | Value |
|-------|--------|
| **Network name** | Arc |
| **RPC URL** | `https://rpc.mainnet.arc.io` |
| **Chain ID** | `5042` |
| **Currency symbol** | USDC |
| **Block explorer** | `https://explorer.arc.io` |

Gas on Arc is paid in **native USDC** (not ETH). Fund the deployer with real USDC on Arc mainnet before deploying.

### Arc Testnet (Circle grant M1)

| Field | Value |
|-------|--------|
| **Network name** | Arc Testnet |
| **RPC URL** | `https://rpc.testnet.arc.io` |
| **Chain ID** | `5042002` |
| **Currency symbol** | USDC |
| **Block explorer** | `https://explorer.testnet.arc.io` |

Fund testnet gas from [faucet.circle.com](https://faucet.circle.com).

---

## Prerequisites

1. **Wallet** with Arc USDC for gas (testnet faucet or mainnet funded wallet)
2. Copy `protocol/.env.example` → `protocol/.env` and set `PRIVATE_KEY` (or `BLOCKCHAIN_PRIVATE_KEY`)
3. Compile on the branch that includes Octane audit fixes

---

## Step 1 — Compile contracts

```bash
cd protocol
npm install
npm run compile
```

---

## Step 2 — Deploy on Arc Mainnet

```bash
cp .env.example .env
# edit .env — set PRIVATE_KEY=0xYourDeployerKey (must hold mainnet USDC for gas)
npm run deploy:arc:mainnet
```

This deploys **in order**: `DealVaultFactory` → `DealsManager(deployer, USDC, factory)`.

Output is written to `protocol/scripts/addresses/arc-mainnet.json`.

### Deployed addresses (Arc mainnet — 2026-09-21)

| Contract | Address |
|----------|---------|
| **DealVaultFactory** | `0x5Dacdbb79A558f9395367badDc6d351053D58B08` |
| **DealsManager** | `0x0F1a18BE854e9924158474fB6828287eAB10F6F6` |
| **USDC** | `0x3600000000000000000000000000000000000000` |
| **Owner / deployer** | `0x916d9dF94a82B63aa95761A9C017fAD46492FEC8` |

Explorer: https://explorer.arc.io/address/0x0F1a18BE854e9924158474fB6828287eAB10F6F6

### Deploy on Arc Testnet (optional / regression)

```bash
npm run deploy:arc
```

Output: `protocol/scripts/addresses/arc-testnet.json`.

### Deployed addresses (Arc testnet — post–Octane fixes, 2026-09-21)

| Contract | Address |
|----------|---------|
| **DealVaultFactory** | `0x4Ff7e80bE6D7776d626Ea8dD7FB896041732B0C4` |
| **DealsManager** | `0xfA3D35C236CFe644786e9B360706eB97CF2836A7` |

Explorer: https://explorer.testnet.arc.io/address/0xfA3D35C236CFe644786e9B360706eB97CF2836A7

---

## Step 3 — Configure the API (mainnet)

```bash
DEAL_CHAIN_RPC_URL=https://rpc.mainnet.arc.io
DEAL_CHAIN_ID=5042
DEAL_CHAIN_EXPLORER=https://explorer.arc.io
BLOCKCHAIN_PRIVATE_KEY=0xSameOwnerKeyAsDeployer
DEALS_MANAGER_CONTRACT_ADDRESS=0x0F1a18BE854e9924158474fB6828287eAB10F6F6
INVESTMENT_TOKEN_CONTRACT_ADDRESS=0x3600000000000000000000000000000000000000
INVESTMENT_TOKEN_DECIMALS=6
INVESTMENT_TOKEN_SYMBOL=USDC
AUTOMATIC_DEALS_ACCEPTANCE=true
```

The API wallet must be the **owner** of `DealsManager` (the deployer address).

See also `api/.env.example`.

---

## Step 4 — Configure the web app (mainnet)

```bash
NEXT_PUBLIC_DEAL_CHAIN_ID=5042
NEXT_PUBLIC_DEAL_CHAIN_RPC_URL=https://rpc.mainnet.arc.io
NEXT_PUBLIC_DEAL_CHAIN_NAME=Arc
NEXT_PUBLIC_DEAL_CHAIN_EXPLORER=https://explorer.arc.io
NEXT_PUBLIC_DEAL_NFT_CONTRACT_ADDRESS=0x0F1a18BE854e9924158474fB6828287eAB10F6F6
NEXT_PUBLIC_DEAL_INVESTMENT_TOKEN_CONTRACT_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_DEAL_INVESTMENT_TOKEN_DECIMALS=6
NEXT_PUBLIC_DEAL_INVESTMENT_TOKEN_SYMBOL=USDC
```

Rebuild/redeploy the web bundle after changing `NEXT_PUBLIC_*` vars. See `web/.env.example`.

---

## Step 5 — Bridge USDC to Arc (CCTP)

Investors/users need USDC **on Arc**.

### CLI (ops / grant demo — testnet)

```bash
cd protocol
export PRIVATE_KEY=0xYourKey
npm run bridge:arc -- Base_Sepolia 5.00
```

### Web UI (TruMarket Finance — ops only)

**Treasury** page (`/treasury`) in the Finance app when `NEXT_PUBLIC_ENABLE_TREASURY_CCTP=true`.

---

## Step 6 — End-to-end validation

1. Bridge / fund USDC on Arc.
2. Create a shipment in the app.
3. Confirm deal record has `nftID`, `mintTxHash`, `vaultAddress`.
4. Open explorer: `DealCreated` on DealsManager; new DealVault contract.
5. (Optional) Borrower `donateToDeal` / `setDealCompleted`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `insufficient funds` / zero balance | Fund deployer with USDC on the target Arc network |
| Mint fails with not owner | API `BLOCKCHAIN_PRIVATE_KEY` must match DealsManager owner |
| Chain ID mismatch | Use `--network arcMainnet` (5042) or `arcTestnet` (5042002) |
| Deal has no `nftID` | Set `AUTOMATIC_DEALS_ACCEPTANCE=true` or `POST /admin/deals/:id/nft/mint` |

---

## Related docs

- [CIRCLE-GRANT-SMART-CONTRACT-FLOW.md](./CIRCLE-GRANT-SMART-CONTRACT-FLOW.md)
- [protocol/README.md](../README.md)
- [Circle CCTP docs](https://developers.circle.com/stablecoins/cctp)
- [Arc docs](https://docs.arc.io)
