# Deploy TruMarket contracts on Arc Testnet

This guide covers deploying **TruMarket-owned** contracts on [Arc Testnet](https://docs.arc.network) for the Circle grant. Circle **CCTP** contracts are already deployed on Arc by Circle — you do not deploy those.

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

## Arc Testnet network (MetaMask / wallet)

| Field | Value |
|-------|--------|
| **Network name** | Arc Network Testnet |
| **RPC URL** | `https://rpc.testnet.arc.network` |
| **Chain ID** | `5042002` |
| **Currency symbol** | USDC |
| **Block explorer** | `https://testnet.arcscan.app` |

Gas on Arc is paid in **native USDC** (not ETH). Fund your deployer from [faucet.circle.com](https://faucet.circle.com).

---

## Prerequisites

1. **Wallet** with Arc Testnet USDC for gas ([faucet.circle.com](https://faucet.circle.com))
2. Copy `protocol/.env.example` → `protocol/.env` and set `PRIVATE_KEY` (or `BLOCKCHAIN_PRIVATE_KEY`)
3. **RPC** — `https://rpc.testnet.arc.network` (already wired as `arcTestnet` in `hardhat.config.ts`)

---

## Step 1 — Compile contracts

```bash
cd protocol
npm install
npm run compile
```

---

## Step 2 — Deploy DealsManager on Arc Testnet

```bash
cp .env.example .env
# edit .env — set PRIVATE_KEY=0xYourDeployerKey
npm run deploy:arc
```

This deploys **in order**: `DealVaultFactory` → `DealsManager(deployer, USDC, factory)`.

Output is written to `protocol/scripts/addresses/arc-testnet.json`:

```json
{
  "network": "arcTestnet",
  "chainId": 5042002,
  "deployer": "0x...",
  "dealVaultFactory": "0x...",
  "dealsManager": "0x...",
  "usdc": "0x3600000000000000000000000000000000000000",
  "explorer": "https://testnet.arcscan.app/address/0x..."
}
```

Verify on [Arcscan Testnet](https://testnet.arcscan.app).

---

## Step 3 — Configure the API

Set in `.env` (or deployment secrets):

```bash
BLOCKCHAIN_RPC_URL=https://rpc.testnet.arc.network
BLOCKCHAIN_CHAIN_ID=5042002
BLOCKCHAIN_PRIVATE_KEY=0xSameOwnerKeyAsDeployer
DEALS_MANAGER_CONTRACT_ADDRESS=0x...from arc-testnet.json
INVESTMENT_TOKEN_CONTRACT_ADDRESS=0x3600000000000000000000000000000000000000
INVESTMENT_TOKEN_DECIMALS=6
INVESTMENT_TOKEN_SYMBOL=USDC
AUTOMATIC_DEALS_ACCEPTANCE=true
ARC_CHAIN_ID=5042002
ARC_RPC_URL=https://rpc.testnet.arc.network
ARC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

The API wallet must be the **owner** of `DealsManager` (the deployer address).

Restart the API after updating env.

---

## Step 4 — Configure the web app

```bash
NEXT_PUBLIC_BLOCKCHAIN_EXPLORER=https://testnet.arcscan.app
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...DealsManager
NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS=6
NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL=USDC
```

Rebuild/redeploy the web bundle after changing `NEXT_PUBLIC_*` vars.

---

## Step 5 — Bridge USDC to Arc (CCTP)

Investors/users need USDC **on Arc** (or on a source chain to bridge).

### CLI (ops / grant demo)

Fund a wallet with USDC on **Base Sepolia** or **Ethereum Sepolia** ([faucet.circle.com](https://faucet.circle.com)), then:

```bash
cd protocol
export PRIVATE_KEY=0xYourKey
npm run bridge:arc -- Base_Sepolia 5.00
# or
CCTP_SOURCE_CHAIN=Ethereum_Sepolia CCTP_AMOUNT=2 npm run bridge:arc
```

### Web UI (TruMarket Finance — ops only)

**Treasury** page (`/treasury`) in the Finance app when `NEXT_PUBLIC_ENABLE_TREASURY_CCTP=true`. Connect an ops wallet via RainbowKit; bridge USDC using Circle Bridge Kit in the browser. Supports **bidirectional** routes (e.g. Base Sepolia → Arc Testnet and Arc Testnet → Base Sepolia). Buyers/suppliers in the main TruMarket app do **not** have a bridge UI.

### API config endpoint

Finance app `GET /api/cctp/config` — returns supported source/destination chains and Arc addresses for the treasury UI.

---

## Step 6 — End-to-end validation

1. Bridge USDC to Arc (CLI or web).
2. Create a shipment in the app.
3. Confirm deal record has `nftID`, `mintTxHash`, `vaultAddress`.
4. Open Arcscan: `DealCreated` event on DealsManager; new DealVault contract.
5. (Optional) Advance milestone / borrower `donateToDeal` on finished deals.

---

## Base mainnet (existing production)

For Base (not Arc), use `deploy-sc/src/0-deploy.ts` with Base USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`. See `deploy-sc/New-Contract.md`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `insufficient funds` on Arc | Request USDC from Circle faucet (gas is USDC on Arc) |
| Mint fails with not owner | API `BLOCKCHAIN_PRIVATE_KEY` must match DealsManager owner |
| Bridge fails | USDC + gas on **source** chain; try `useForwarder: true` (default) |
| Deal has no `nftID` | Set `AUTOMATIC_DEALS_ACCEPTANCE=true` or `POST /admin/deals/:id/nft/mint` |

---

## Related docs

- [CIRCLE-GRANT-SMART-CONTRACT-FLOW.md](./CIRCLE-GRANT-SMART-CONTRACT-FLOW.md)
- [protocol/README.md](../README.md)
- [Circle CCTP docs](https://developers.circle.com/stablecoins/cctp)
- [Arc integration](https://docs.arc.network)
