# TruMarket Buyer & Supplier Platform — Changelog

Generated from the `commit-range-documentation` skill. Each entry covers the git range between labelled version points, with a semver classification, blast radius, and change narrative.

---

## v0.0.0 — Baseline (before October 2025)

**Commit**: `898033b` · 2025-07-22  
**State**: Feature-complete backend and frontend, deployed to production. All core deal lifecycle functionality was in place — NestJS API, ERC-721 `DealsManager` + ERC-4626 `DealVault` smart contracts on Base, Web3Auth login, investor deposit/withdraw flows, milestone tracking, KYC/OTP signup, email notifications, in-app notifications, admin panel, Liquidity Pool (#23), and full AWS infrastructure (ECS + ALB + Terraform).

This is the reference point for everything that follows.

---

## v1.0.0 — Auth & Stability Hardening (Oct 2025)

**Range**: `898033b` → `273505d`  
**Date**: 2025-10-03  
**Semver classification**: **PATCH** → bumped to v1.0.0 as the first tracked release  
**Blast radius**: 4 files, +88 / -69 lines

### What changed
- **Web3Auth connection ID** now loaded from environment config instead of being hardcoded; debug logs added to confirm deal flow.
- **OTP signup guard**: account existence is checked before sending an OTP — prevents silently creating duplicate accounts.
- **Contract summary NaN fix**: `NaN` appearing in the deal creation contract summary was resolved.

### Migration
- Web3Auth connection ID must be added to the web environment configuration.
- No contract changes. No schema changes.

### Notable commits
`273505d` use NEXT_PUBLIC_WEB3AUTH_CONNECTION_ID and add logs to confirm deals  
`470e22c` add check account existence before senting an otp  
`731d2e4` fix NaN on contract summary during creation

---

## v1.1.0 — UI Redesign + Smart Contract Security Audit (Oct–Nov 2025)

**Range**: `273505d` → `f731009`  
**Date**: 2025-11-07  
**Semver classification**: **MINOR** — new visual theme, CI/CD pipeline, and smart contract audit fixes  
**Blast radius**: 34 files, +4,414 / -1,224 lines

### What changed

#### Security
- **Smart contract audit resolved** — 6 vulnerability classes addressed in `DealsManager.sol` and `DealVault.sol`:
  - `C-01` Critical: arithmetic overflow
  - `C-02` Critical: access control gap
  - `H-02` High: reentrancy vector
  - `M-01` Medium: precision loss on fund distribution
  - `L-01` / `L-10` Low: missing events
- **ABIs regenerated** — `DealVault.abi.ts` and `DealsManager.abi.ts` updated to match the patched contracts.
- Sentry error tracking import issue fixed.
- RSA JWT login error resolved.

#### Frontend
- **Full web design + theme overhaul** — new colour palette, Tailwind config, and global CSS rewritten.
- **CI/CD pipeline added** for development branches and PRs to main.
- Design overlapping and layout issues fixed post-redesign.

### Migration
- **Contract redeployment required** if running own instance — audit fixes change contract behaviour (access control, reentrancy guard).
- Update all ABI imports to pick up new function signatures.

### Notable commits
`f731009` resolve C-01, C-02, H-02, M-01, L-01, and L-10 smart contract vulnerabilities  
`3618594` update dealsmanager contract  
`37d597e` update abis for contracts  
`2a839aa` change web design and theme  
`b565d14` add CI/CD for development and PRs to main

---

## v1.2.0 — ICP & AWS Decommissioned (Nov–Dec 2025)

**Range**: `f731009` → `dbdb653`  
**Date**: 2025-12-26  
**Semver classification**: **MINOR** — two infrastructure layers removed, deal sync deactivated, minor frontend polish  
**Blast radius**: 81 files, +4,554 / -6,689 lines (more deletions than additions)

### What changed

#### Infrastructure
- **ICP (Internet Computer Protocol) data layer deleted** (`e3a6b49`) — the `finance-app` directory and all ICP canister client code removed from the codebase. The deal sync integration with the ICP backend is gone.
- **AWS infrastructure removed** (`dbdb653`) — AWS SDK dependencies, ECS/ALB module wiring, and Cognito-linked auth code removed from `app.module.ts`, `auth.service.ts`, `main.ts`, and `logger.ts`. The platform runs on Vercel + MongoDB going forward.
- **Deal sync job deactivated** — `syncDealsLogs.ts` was updated to be a no-op (the sync logic is commented out with an explicit `// DISABLED` comment, not deleted). The job still runs but exits immediately.
- **KYC module disabled** — `kyc.module.ts` cleaned up; KYC remains off.

#### Frontend
- Brand green colour updated to new shade.
- Step numbering updated in milestone UI.
- `components.json` added (shadcn/ui config).
- Login issue after infra changes resolved.

### Migration
- ICP-related configuration should be removed from the environment.
- Decommission AWS ECS/ALB infrastructure. The platform runs on Vercel.
- Confirm MongoDB connection string is set in the Vercel project environment.

### Notable commits
`e3a6b49` remove icp config  
`dbdb653` remove AWS  
`8e4cb41` fix logging in

---

## v1.3.0 — Supplier Bank Accounts & Payout Flow (Dec 2025–Mar 2026)

**Range**: `dbdb653` → `43ea1e9`  
**Date**: 2026-03-02  
**Semver classification**: **MINOR** — new supplier payout surface, deposit flow UI, Vercel deployment stabilisation  
**Blast radius**: 97 files, +9,235 / -6,630 lines

### What changed

#### New features
- **Supplier bank accounts module** (`bank-accounts.controller.ts`, `bank-accounts.service.ts`, `bank-accounts.entities.ts`, `bank-accounts.repository.ts`) — full CRUD for supplier bank account details, including a background sync scheduler.
- **Pay supplier flow** — user model updated to store bank details per supplier; `updateBankDetails.dto.ts` added. Frontend `BankAccountsAPI.service.ts` wired up.
- **Investor deposit flow UI** — full multi-step deposit wizard added to the web app: `DepositDialog.tsx`, `Stepper.tsx`, `StepPaymentDetails.tsx`, `StepEnterBankDetails.tsx`, `StepConfirmBank.tsx`, `StepReviewPay.tsx`, `StepCheckBank.tsx`, `deposit-types.tsx`, `deposit-validators.tsx`. Covers payment details, bank selection, review, and confirmation.
- **Withdraw dialog** — `WithdrawDialog.tsx` added alongside the deposit flow.
- **S3 storage service** — `storage.service.ts` added for document/file storage.

#### Protocol
- Security audit document committed to the repo for reference (`security-audits/` directory).
- `DealVault.sol` and `DealsManager.sol` updated (follow-on from v1.1.0 audit).

#### Stability
- **Deal sync job remains deactivated** (`32532e2`) — confirmed no-op, pending stability review.
- GitHub Actions workflows cleaned up — stale CI files removed.
- UI bugs fixed: milestone change flow, header layout.

### Migration
- New MongoDB collection expected: `bank-accounts`. Ensure the database user has write access.
- No breaking API changes for existing deal/milestone endpoints.

### Notable commits
`43ea1e9` add bank details to supplier user model, and add pay supplier  
`32532e2` fix vercel deployment changes and comment out the deals sync  
`7cd7b67` update github workflows, and remove useless files  
`dfabcc9` fix UI bugs, milestones change flow, and update header

---

## v2.0.0 — Liquidity Pool Model, AgroPay Payment Rail & Bank Account Approval (Mar–May 2026)

**Range**: `43ea1e9` → `5c1ca29`  
**Date**: 2026-05-05  
**Semver classification**: **MAJOR** — the financial product model fundamentally changed (per-deal vaults replaced by an admin-allocated shared liquidity pool), a new payment rail (OSN, surfaced as **AgroPay**) was introduced for fiat on-ramp and supplier off-ramp, and bank accounts now go through a third-party approval workflow.  
**Blast radius**: 152 files, +11,101 / -2,637 lines

### Why this is a MAJOR bump

Three independent triggers from the `commit-range-documentation` skill's MAJOR rules fire in this range — any one alone would justify it:

1. **Capital allocation model replaced.** Investors no longer fund individual deals; they deposit into a shared, low-risk liquidity pool that TruMarket allocates from. (Skill rule: *"per-deal investing replaced by a shared liquidity pool; yield model changed; who controls capital allocation changed"*.)
2. **Entire payment subsystem added.** A new external payment rail — OSN, surfaced to buyers as **AgroPay** — is wired into deposit, withdrawal, and supplier payout flows.
3. **External approval gating introduced.** Buyer bank accounts now traverse a third-party approval state machine before becoming usable. Existing flows that assumed a saved account was immediately usable no longer hold.

### What changed

#### Capital allocation: per-deal vaults → shared liquidity pool

**Before (v1.x).** Every deal had its own ERC-4626 `DealVault`. Investors deposited USDC directly into a deal's vault. When the vault hit its funding target, funds were automatically released to the supplier. Returns were per-deal and depended on which vault the investor picked.

**After (v2.0).** Investors deposit into a single shared, low-risk **TruMarket liquidity pool** built on Lagoon vaults. **TruMarket admins decide which deals to fund** out of that pool; investors no longer pick deals. Returns are an **average APY across the deals TruMarket has allocated capital to**. The on-chain `DealVault` per-deal display in the shipment detail page is now **read-only** — live investor money does not flow through it. The smart contracts (`DealVault`, `DealsManager`) are slated for full removal in a follow-up release.

Concrete consequences:

- The "fund this deal" investor action is gone; investors have a single pool deposit/withdraw surface.
- Auto-release of supplier funding on full vault funding is no longer in effect — supplier payouts are now driven by the payments module (see below), not by vault state.
- Yield economics change: investors earn an average APY across the pool's funded positions, not a per-deal IRR.

#### Payments: AgroPay on-ramp and supplier off-ramp

A complete payments subsystem was added (`payments.service.ts`, `payments.controller.ts`, `payments.module.ts`, `payments.entities.ts`, `payments.model.ts`, `payments.repository.ts`, `payments-sync.scheduler.ts`).

- **Payment lifecycle**: `payment_requested → in_progress → verifying_documents → completed | failed`. TruMarket admins drive document verification; status transitions are persisted on the `Payment` record.
- **AgroPay on-ramp** (the buyer-facing brand for OSN-powered payments; method enum `OSN_ONRAMP`). Buyers initiating a payment go through AgroPay: a mint request is opened with the OSN provider, the buyer submits a fiat bank transfer reference, and OSN mints USDC to TruMarket's destination wallet. Pre-mint fee quotes are computed by `admin-dashboard-fee-quote.service.ts` and snapshotted onto the payment.
- **Supplier off-ramp request**. Suppliers can flag a completed payment for off-ramp via `isOfframpRequested`, so funds get withdrawn back to fiat after the deal completes.
- **Provider transfer ledger**. Each OSN interaction is logged as a `PaymentProviderTransfer`, capturing request/response snapshots, OSN ids (`mint_request_id`, `payment_id`), `depositInstructions`, `estimatedFees`, `payInBankDetails`, and `actorUserId`. Status updates from OSN are picked up by the payments sync scheduler.
- **Per-step notifications**. The payment record tracks notification timestamps for each lifecycle step (payment initiated, buyer transfer proof submitted, admin verifying, OSN deposit completed, documents verified, supplier payout sent), so emails and in-app notifications are not duplicated across retries.

A new payments table is surfaced per shipment in the deal detail UI, and `PaymentDocumentUploadDialog.tsx` provides a structured upload flow for payment evidence.

#### Bank accounts: role-specific behaviour and OSN approval

The bank accounts module is now role-aware:

- **Buyers — multiple accounts, OSN-approved.** Saving a buyer bank account creates an OSN organization bank via `POST /api/v4/users/me/organization-banks`. The local `BankAccount` is created with `status: PENDING_APPROVAL` (OSN `is_active: false`) and only flips to `ACTIVE` once OSN approves it. **Only `ACTIVE` accounts can be set as default**, and only the default `ACTIVE` account is eligible to be used for an AgroPay mint request. An admin sync endpoint (`POST /bank-accounts/sync/osn-organization-banks`) reconciles local status with OSN.
- **Suppliers — exactly one active account, internal only.** Saving a supplier bank account archives all prior supplier bank records and creates a new one with `status: ACTIVE`, `isActive: true`, `isDefault: true`. OSN is **not** called for supplier accounts. The legacy `PUT /auth/bank-details` endpoint is retained as a deprecated shim that converts old embedded bank details into a new supplier `BankAccount` record.

The web app exposes this via `AddBankAccountDialog.tsx`, `BankAccountsSection.tsx`, and `BankAccountDetailsModal.tsx`, with role-aware UI that hides multi-account management from suppliers.

#### Milestones: fixed 7 → flexible

Deal creators previously had to define exactly 7 milestones. The shipment creation flow now starts with a **single default milestone** and lets the creator add more, choosing from preset milestone types (production, fields, harvest, etc.) or custom "Other" labels (cap of 3 custom labels). Each milestone has its own `fundsDistribution` percentage and they must sum to 100. Existing deals continue to render their stored milestone count.

> **Known mismatch.** The API DTO (`createDeal.dto.ts`, `updateDeal.dto.ts`) still validates `ArrayMinSize(7)` / `ArrayMaxSize(7)`. The web frontend currently caps additions at 10 and starts at 1. This validation gap should be resolved before relaxing the frontend cap further or before any out-of-tree clients start posting deals — see the Migration section.

#### Automatic payment document identification

Client-side classifier (`web/src/lib/payment-document-classifier/`) auto-detects uploaded payment PDFs by filename hints and parses contents via `parser.ts`. The five recognised types are **Commercial Invoice, Packing List, Bill of Lading or AWB, Phytosanitary Certificate, Certificate of Origin**, plus an explicit **Others** fallback for unrecognised documents. The fix in `5c1ca29` resolves false-negative detections that previously routed uploads into the wrong type. A payment moves into `verifying_documents` only once all five required types are uploaded.

#### Other surfaces

- **Rich email templates** (`email-rich-template.tsx`) replace plain-text mailing notifications.
- **Platform settings store** (`trumarket-settings.*`, `osn-runtime-settings.*`) — key/value config that lets ops toggle OSN/AgroPay behaviour without redeployment.
- **Part B deposit flow** (`PartBFlowSteps.tsx`, `StepFees.tsx`, `DepositFlowInfoNote.tsx`, `fee-display.ts`, `osn-transfer-display.ts`) extends the deposit wizard with fee review and AgroPay submission steps.
- `horizontal-milestones.tsx` — compact milestone progress display.
- `web3-auth-context.tsx` — improved wallet connection lifecycle.

### Migration

Operators upgrading from v1.3.0 must:

1. **Deploy the Lagoon-backed liquidity pool** and configure the API to point at it. Investor deposit/withdraw flows now go through the pool, not per-deal vaults.
2. **Stop relying on `DealVault` for live capital flow.** The per-deal vault display is read-only; live deposits route through the pool. Any external integration that was reading vault balances to infer deal funding state needs to switch to the pool/admin allocation source of truth.
3. **Provision OSN/AgroPay credentials and runtime settings** (organization id, default wallet/recipient/chain id, default currency code) so AgroPay can mint on behalf of buyers. These must be configured in the API environment.
4. **Create three new MongoDB collections**: `payments`, `payment-provider-transfers`, `trumarket-settings`. Ensure the database user has write access to all three.
5. **Re-onboard buyer bank accounts through the new flow.** Previously saved buyer bank details (legacy embedded `bankDetails` on the user) need to be re-saved through `POST /bank-accounts` so they get an OSN `providerAccountId`. Until OSN approves, those accounts remain `PENDING_APPROVAL` and cannot be used as default. Communicate this to existing buyers before cutover.
6. **Migrate supplier bank details.** Suppliers should re-save through `POST /bank-accounts` on first login post-upgrade; the legacy `PUT /auth/bank-details` endpoint stays for backward compatibility but is deprecated.
7. **Clients posting deals must still send exactly 7 milestones** until the API DTO is relaxed, even though the in-tree web app now collects 1–N milestones.
8. **Document the AgroPay brand** in customer-facing material if you reference the integration; internally and in API enums it is `OSN_ONRAMP`.

### Notable commits

`d2148df` add OSN API integration  
`746ca43` update upload docs  
`b2920fe` update mailing notifications  
`cd18121` update notifications  
`5c1ca29` fix payment pdf detection errors and add others option  
`a5cc07c` Merge pull request #9 from AgroSmart-Contracts/feat/agropay  
`43ea1e9` add bank details to supplier user model, and add pay supplier *(end of v1.3.0; covered there)*

---

## Unreleased / What's next

- **Remove `DealVault` and per-deal vault wiring from the smart contracts** (the on-chain artefacts are kept for read-only display in v2.0.0; live capital no longer flows through them).
- **Relax the API milestones DTO** from fixed 7 to dynamic 1–N to match the web app's new milestone editor.
- **Arc testnet deployment** of the remaining `DealsManager` (EVM-compatible; requires Arc RPC added to `hardhat.config.ts`).
- **Circle CCTP / Bridge Kit** integration for cross-chain USDC deposits — implemented in `protocol/scripts/cctp/`, `web/BridgeUsdcDialog`, `GET /cctp/config`.
- **Deal sync re-enablement** (`syncDealsLogs` is currently deactivated / no-op).
- **KYC module re-enablement** (disabled since v1.2.0).
- **`nftId` verification re-enablement** (commented out during testing; should gate deal progression in production).

---

*Generated by the `commit-range-documentation` skill. Commit hashes reference the `trumarket` repository (AgroSmart-Contracts/trumarket). Semver versions are retroactively assigned for documentation purposes — the repo does not use git tags.*
