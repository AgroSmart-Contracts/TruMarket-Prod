# TruMarket Protocol (Deal + Shipment Tracking)

This repo contains a minimal Hardhat setup for TruMarket deal lifecycle tracking.

## Vault model update

- We no longer create a per-deal `DealVault`.
- Liquidity is managed by Lagoon (one big, Lagoon-managed liquidity pool / vault).
- On-chain, we only track deal progression (and shipments/milestones) via `DealsManager`.
- Funding transfers are handled off-chain by an admin using Lagoon. As a result, `DealsManager.proceed()` emits `DealMilestoneChanged` with `amountTransferred = 0`.

## Contracts

- `DealsManager` (`ERC721`): mints a deal NFT and tracks deal state.
  - `createDeal(milestones, maxDeposit)` (buyer-led)
  - `mint(milestones, maxDeposit, borrower)` (admin-only; legacy alias for buyer-led creation)
  - `inviteSupplier(dealId, supplier)` (buyer-led; sets the supplier to be paid)
  - `publishToInvestors(dealId)` (buyer or supplier)
  - `assignRiskScore(dealId, riskScore)` (admin-only; derives/stores APY for Lagoon)
  - `markDealFunded(dealId)` (admin-only; marks Lagoon-funded deals)
  - `setDealVault(dealId, perDealVault)` (admin-only; stores Lagoon per-deal vault address)
  - `proceed(dealId, nextMilestone)` (buyer/supplier; sequential milestones; allowed only after funding)
  - `setDealCompleted(dealId)` (buyer/supplier; after milestone 7; allowed only after funding)
  - Backwards-compatible alias: `changeDealBorrower(dealId, newBorrower)` -> `inviteSupplier(...)`
  - Views: `status(dealId)`, `dealStage(dealId)`, `milestones(dealId)`, `maxDeposit(dealId)`, `buyer(dealId)`, `borrower(dealId)`, `vault(dealId)`, `riskScore(dealId)`, `apyBps(dealId)`

## Local development

```shell
npm install
npm run local:deploy
npm run local:mint
npm test
```
