# Circle Developer Grant: Milestone 2 Submission Pack

**Project:** TruMarket  
**Grant milestone:** Milestone #2, Arc Mainnet Launch ($5,000)

### Arc mainnet deployment (chain ID `5042`)

| Contract | Address | Explorer |
|----------|---------|----------|
| **DealsManager** | `0x0F1a18BE854e9924158474fB6828287eAB10F6F6` | [explorer.arc.io](https://explorer.arc.io/address/0x0F1a18BE854e9924158474fB6828287eAB10F6F6) |
| **DealVaultFactory** | `0x5Dacdbb79A558f9395367badDc6d351053D58B08` | [explorer.arc.io](https://explorer.arc.io/address/0x5Dacdbb79A558f9395367badDc6d351053D58B08) |
| **USDC** (Circle, native) | `0x3600000000000000000000000000000000000000` | underlying asset for every `DealVault` |

| | |
|---|---|
| **Deployer wallet** | `0x916d9dF94a82B63aa95761A9C017fAD46492FEC8` |
| **Deployed** | 21 Sep 2026, 05:43 UTC |
| **Address record** | [`protocol/scripts/addresses/arc-mainnet.json`](../protocol/scripts/addresses/arc-mainnet.json) |

> **Same addresses as the first testnet deployment.** The Milestone 1 contracts on Arc **testnet** (`5042002`) sit at the same two addresses, because the same wallet deployed with the same nonces. Check the chain ID when reading an explorer: `5042` is mainnet, `5042002` is testnet. The current testnet deployment (after audit hardening) is `DealsManager` `0xfA3D35C236CFe644786e9B360706eB97CF2836A7` and `DealVaultFactory` `0x4Ff7e80bE6D7776d626Ea8dD7FB896041732B0C4`.

**Demo video:** linked in the submission form.

---

## 1. Executive summary

Milestone 1 put TruMarket's on-chain deal layer on Arc testnet. Milestone 2 takes the same contracts to **Arc mainnet**:

- `DealVaultFactory` and `DealsManager` are deployed on Arc mainnet and hold code at the addresses above.
- The contracts were hardened against the findings of an ERC-4626 audit (Octane) **before** the mainnet deployment, and redeployed on testnet from the same source.
- The deploy tooling, the API and the web app are configured for Arc mainnet as the deal chain.

What Arc mainnet is used for is unchanged from Milestone 1: **deal identity and borrower repayment**. Each deal is an ERC-721 token in `DealsManager` with its own ERC-4626 `DealVault` whose asset is native USDC. Investor capital still flows through the Lagoon pool on Base, and supplier payouts and trade milestones remain off-chain.

---

## 2. Milestone #2 deliverables checklist

| # | Deliverable | Status | Evidence |
|---|-------------|--------|----------|
| 1 | Deploy on **Arc mainnet** within 30 days of Arc mainnet launch | ✅ Deployed 21 Sep 2026 | Addresses above; [`arc-mainnet.json`](../protocol/scripts/addresses/arc-mainnet.json) |
| 2 | Contracts audited and hardened before mainnet | ✅ Done | Commit `faee66d` (§4); 32 Hardhat tests passing |
| 3 | Deploy tooling for mainnet | ✅ Done | `arcMainnet` network in [`hardhat.config.ts`](../protocol/hardhat.config.ts); [`deploy-arc.ts`](../protocol/scripts/deploy-arc.ts); `npm run deploy:arc:mainnet`; [DEPLOY-ARC.md](../protocol/docs/DEPLOY-ARC.md) |
| 4 | Application configured for Arc mainnet | ✅ Done in config | `api/.env.example` and `web/.env.example` set the deal chain to `5042`; ABIs synced (§5) |
| 5 | First deal created on Arc mainnet | ⏳ Not yet | No deal has been minted on mainnet at the time of writing (§6) |
| 6 | CCTP route to Arc **mainnet**, and CCTP post-bridge deposit into the Lagoon pool | ⏳ Not yet | The bridge configuration still targets Arc testnet (§7) |
| 7 | Progress report | ✅ This document | |
| 8 | Demo video | Linked in the submission form | |

---

## 3. What changed since Milestone 1

| Area | Milestone 1 (testnet) | Milestone 2 (mainnet) |
|------|-----------------------|------------------------|
| Deal chain | Arc testnet `5042002` | Arc mainnet `5042` |
| RPC | `https://rpc.testnet.arc.io` | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.testnet.arc.io` / `testnet.arcscan.app` | `https://explorer.arc.io` |
| Gas | Faucet USDC | Real USDC (Arc pays gas in native USDC) |
| Contract source | Pre-audit | Hardened after the Octane ERC-4626 review |
| Deploy command | `npm run deploy:arc` | `npm run deploy:arc:mainnet` |
| API deal-chain config | testnet values | mainnet values, testnet kept as a commented fallback for regression |

The contract architecture is the same:

```
DealVaultFactory            deployed once per network
DealsManager (ERC-721)      deployed once per network; owner = TruMarket
  └─ mint(maxDeposit, borrower)
       └─ DealVaultFactory deploys one DealVault (ERC-4626, asset = USDC) per deal
```

The factory exists so that `DealsManager` stays under the 24 KB contract size limit.

---

## 4. Audit hardening before mainnet

Commit `faee66d` ("harden DealVault ERC-4626 against Octane audit findings") changed `DealVault.sol` and `DealsManager.sol`:

- **Capacity is tracked against deposited principal**, not the vault's raw balance, so a small direct transfer or a donation cannot use up a deal's remaining deposit headroom.
- **Rounding follows ERC-4626**: `mint` rounds the assets charged up, and `withdraw` rounds the shares burned up, so neither can under-charge.
- **`maxDeposit`, `maxMint`, `maxWithdraw` and `maxRedeem` return zero** while the vault is paused or deposit-blocked, as the standard expects.
- **`reopenVault` no longer unblocks deposits** as a side effect.

Tests: `protocol/test/` holds 32 cases across `dealVault.test.ts`, `dealVault.inflation.test.ts` and `dealsManager.test.ts`. All 32 pass (`npm test` in `protocol/`, run 12 Oct 2026).

The hardened source was redeployed on Arc testnet first (21 Sep 2026, 05:40 UTC) and then deployed on Arc mainnet (05:43 UTC).

---

## 5. Application configuration for Arc mainnet

| Component | Change | File |
|-----------|--------|------|
| Protocol | `arcMainnet` network, chain `5042` | [`protocol/hardhat.config.ts`](../protocol/hardhat.config.ts) |
| Protocol | One deploy script for both networks; writes the address file | [`protocol/scripts/deploy-arc.ts`](../protocol/scripts/deploy-arc.ts) |
| Protocol | Arc mainnet CCTP constants (domain 26, TokenMessengerV2, MessageTransmitterV2) | [`protocol/scripts/cctp/constants.ts`](../protocol/scripts/cctp/constants.ts) |
| API | `DEAL_CHAIN_ID=5042`, mainnet RPC and explorer, mainnet `DealsManager` address | [`api/.env.example`](../api/.env.example), [`api/src/config.ts`](../api/src/config.ts) |
| API | `DealsManager` ABI regenerated from the hardened contract | [`api/src/blockchain/dealsManager.abi.ts`](../api/src/blockchain/dealsManager.abi.ts) |
| Web | `NEXT_PUBLIC_DEAL_CHAIN_ID=5042`, ABI synced | [`web/.env.example`](../web/.env.example) |

The web app keeps two chains: a **wallet chain** for login and custody, and a **deal chain** (Arc) for `DealsManager` and `DealVault` calls. This split was introduced in Milestone 1 because the embedded-wallet login provider did not support Arc at the time.

---

## 6. How to verify

1. Open the two contract addresses on [explorer.arc.io](https://explorer.arc.io) and confirm the chain is `5042`.
2. Or query any Arc mainnet RPC:

   ```bash
   curl -s https://rpc.mainnet.arc.io -H 'content-type: application/json' \
     --data '{"jsonrpc":"2.0","id":1,"method":"eth_getCode","params":["0x0F1a18BE854e9924158474fB6828287eAB10F6F6","latest"]}'
   ```

   A non-empty result is the deployed `DealsManager`.
3. Reproduce the deployment from source: `cd protocol && npm run deploy:arc:mainnet` (see [DEPLOY-ARC.md](../protocol/docs/DEPLOY-ARC.md)).
4. Run the contract tests: `cd protocol && npm test`.

No deal exists on mainnet yet. The first one's `mint` transaction, token ID and `DealVault` address will be added here.

---

## 7. Progress report & learnings

### What we shipped
- `DealVaultFactory` and `DealsManager` on Arc mainnet.
- ERC-4626 hardening from an external audit, with tests, before any mainnet deployment.
- A single deploy script and documented command for testnet and mainnet.
- API and web configuration and ABIs moved to Arc mainnet, with the testnet values kept for regression.

### What we learned
- **Auditing before mainnet changed the contracts**, so testnet had to be redeployed. Deploying testnet and mainnet from the same commit within minutes of each other keeps the two comparable.
- **Deterministic addresses are easy to misread.** The mainnet contracts share addresses with the first testnet deployment. Every reference now states the chain ID next to the address.
- **Paying gas in USDC simplifies operations**: the deployer needs only one asset on Arc.

### Not done yet
- **No deal has been created on Arc mainnet.** On-chain activity so far is the two deployments. Deal operations continue off-chain and on the existing production setup until the first mainnet deal is minted.
- **CCTP still targets Arc testnet.** `api/src/cctp/cctp.constants.ts` lists testnet source chains and `Arc_Testnet` as the destination. A mainnet route (for example Base to Arc) is not configured.
- **The CCTP post-bridge deposit into the Lagoon pool**, listed as a next step in the Milestone 1 report, is not built.
- **User wallets are not on Arc.** Login and custody stay on the wallet chain; only deal contracts are on Arc.

### Next steps
- Create the first production deal on Arc mainnet and record its transactions here.
- Add a mainnet CCTP route in the treasury tooling and the post-bridge Lagoon deposit helper.
- Verify the contract source on the Arc explorer.

---

## 8. Links to attach

| Resource | URL |
|----------|-----|
| Live buyer/supplier app | https://app.trumarket.tech |
| **Demo video** | Linked in the submission form |
| DealsManager (Arc mainnet) | https://explorer.arc.io/address/0x0F1a18BE854e9924158474fB6828287eAB10F6F6 |
| DealVaultFactory (Arc mainnet) | https://explorer.arc.io/address/0x5Dacdbb79A558f9395367badDc6d351053D58B08 |
| Deployer wallet | https://explorer.arc.io/address/0x916d9dF94a82B63aa95761A9C017fAD46492FEC8 |
| Mainnet deployment transactions | Listed on the deployer wallet's page above |
| Milestone 1 submission | [CIRCLE-GRANT-MILESTONE-1-SUBMISSION.md](./CIRCLE-GRANT-MILESTONE-1-SUBMISSION.md) |
| Circle flow doc | [CIRCLE-GRANT-SMART-CONTRACT-FLOW.md](../protocol/docs/CIRCLE-GRANT-SMART-CONTRACT-FLOW.md) |
| Arc deploy guide | [DEPLOY-ARC.md](../protocol/docs/DEPLOY-ARC.md) |
