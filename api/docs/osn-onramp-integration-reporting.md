## OSN On-Ramp Integration Reporting

This document describes what the backend does when TruMarket integrates with OSN for buyer on-ramp mint requests, and how we persist OSN activity for later reporting/auditing.

## Actors and attribution

1. **TruMarket (system identity)** is used for all OSN API calls (we do not authenticate as the end-user against OSN).
2. **TruMarket user (buyer)** is recorded as `actorUserId` on OSN-related provider transfers so we can trace who initiated what.

## Where OSN activity is recorded (DB)

### `BankAccount` (buyer organization banks / supplier payout bank)

For **buyer** bank accounts:
- `providerAccountId` stores OSN `id` returned by:
  - `POST /api/v4/users/me/organization-banks`
- `providerPayload` stores `{ request, response }` for audit/debug.
- `status` reflects *provider activation eligibility for TruMarket*:
  - `ACTIVE` when OSN `is_active === true`
  - `PENDING_APPROVAL` when OSN `is_active === false`
- `isActive` mirrors OSN `is_active` (debug/back-compat).

For **supplier** bank accounts:
- We do **not** call OSN for supplier payout accounts.
- `status`/`isActive` are set as `ACTIVE` by the internal service layer.

### `PaymentProviderTransfer` (OSN mint lifecycle)

For each OSN mint request we create one `PaymentProviderTransfer` record.

We persist:
- `request` snapshot (payload sent to OSN)
- `response` snapshot (OSN response received)
- `providerMintRequestId` = OSN `mint_request_id`
- `providerPaymentId` = OSN `payment_id`
- `providerStatus` = OSN `status` (initial) and updated later on submit
- `depositInstructions` = OSN `deposit_instructions`
- `estimatedFees` = OSN `estimated_fees`
- `payInBankDetails` = OSN `pay_in_bank_details`
- `actorUserId` = TruMarket user who initiated the OSN mint request

## Status ownership (what changes where)

1. **`Payment.status`** is TruMarket’s business workflow status (document upload/verification/progress).
   - Who updates it: internal payment/document services and admin verification flow.
2. **`BankAccount.status`** is TruMarket’s status for selecting/using a bank account.
   - Who updates it for buyers: OSN-driven logic in `BankAccountsService.createForUser()` plus optional sync endpoint.
3. **`PaymentProviderTransfer.providerStatus`** is OSN’s provider-side lifecycle status for the mint request.
   - Who updates it:
     - Initially from OSN response when creating the mint request
     - Later when the buyer submits `bank_tx_number`

## Buyer flow: saving bank details

Buyer bank details are saved as **OSN organization bank accounts**.

### Step 1: Create bank account (OSN-first)
- UI action (buyer) calls:
  - `POST /bank-accounts`
- Backend path:
  - `BankAccountsController.create()` -> `BankAccountsService.createForUser()`
- Backend behavior:
  1. Calls OSN:
     - `POST /api/v4/users/me/organization-banks`
     - Uses OSN org id from `OSN_ORGANIZATION_ID` (`osnConfig.organizationId`)
     - Maps TruMarket input fields to OSN required fields:
       - `settlement_bank_name`
       - `settlement_account_number`
       - `settlement_account_holder_name`
       - `settlement_swift_bic`
       - optional `settlement_routing_number`, `settlement_iban`, address fields
     - OSN `is_active` starts as `false` (we always submit creation as inactive; OSN approves later).
  2. OSN returns the organization bank object including `id` and `is_active`.
  3. Backend creates the local `BankAccount` from OSN response:
     - `providerAccountId = response.id`
     - `providerPayload = { request, response }`
     - `status = ACTIVE` if OSN `is_active === true`, else `PENDING_APPROVAL`
     - `isActive` mirrors OSN `is_active`
     - `isDefault` is set only when the bank is initially `ACTIVE`

### Step 2: Set default bank (only ACTIVE)
- UI action (buyer) calls:
  - `POST /bank-accounts/:id/set-default`
- Backend rule:
  - Only accounts with `BankAccount.status === ACTIVE` can be default.
  - Backend unsets other defaults for the same provider and sets the selected one.

### Step 3: Activation status refresh (optional / admin)
- OSN approval is asynchronous.
- Backend provides an admin/system helper endpoint:
  - `POST /bank-accounts/sync/osn-organization-banks`
- Behavior:
  - Calls `GET /api/v4/users/me/organization-banks` (via OSN client)
  - Updates local `BankAccount.status` and `isActive` based on OSN `is_active`

## Supplier flow: saving bank details

Supplier payout bank details are stored **internally** only (no OSN organization bank creation).

### Step 1: Create supplier bank record (first save)
- UI action may call:
  - `POST /bank-accounts` (supplier account type)
- Backend path:
  - `BankAccountsController.create()` -> `BankAccountsService.createForUser()`
- Backend behavior:
  - Archives existing non-archived supplier bank records
  - Creates a new `BankAccount` with:
    - `status: ACTIVE`
    - `isActive: true`
    - `isDefault: true`

### Step 2: Update supplier bank record in-place (subsequent saves)
- UI action calls:
  - `PUT /bank-accounts/:id`
- Backend path:
  - `BankAccountsController.update()` -> `BankAccountsService.updateForUser()`
- Backend behavior:
  - Enforces supplier-only updates
  - Archives other supplier bank accounts
  - Updates the existing record fields (account holder/name/bank number, etc.)

### Legacy endpoint (still present): `PUT /auth/bank-details`
- `AuthController.updateBankDetails()` converts legacy embedded bankDetails into a new supplier `BankAccount` record.
- This endpoint is deprecated in behavior (it exists for backward compatibility).

## Buyer flow: creating a payment request (OSN mint request)

### Step 1: Initiate OSN mint request
- UI action calls:
  - `POST /payments/:id/osn/mint-request`
- Backend path:
  - `PaymentsPublicController.createMintRequest()` -> `PaymentsService.createOsnMintRequest()`
- Backend behavior:
  1. Validates the caller is the buyer for that `Payment`.
  2. Determines the OSN organization bank id:
     - Prefer `OSN_DEFAULT_ORGANIZATION_BANK_ID`
     - Otherwise find the buyer’s local `BankAccount` where:
       - `provider=OSN`
       - `status=ACTIVE`
       - `isDefault=true` (fallback: any ACTIVE)
  3. Determines OSN minting destination:
     - Uses `OSN_DEFAULT_WALLET_ID` or `OSN_DEFAULT_RECIPIENT_ID`
     - Requires `OSN_DEFAULT_CHAIN_ID`
  4. Calls OSN:
     - `POST /api/v4/users/me/minting/request`
     - Payload built from `Payment` + OSN defaults:
       - `amount` = `Payment.amount`
       - `currency` = prefers `Payment.currency` if it is `USDC`/`USDT`, else uses `OSN_DEFAULT_CURRENCY_CODE`
       - `destination.wallet_id` or `destination.recipient_id`
       - `destination.chain_id`
       - `organization_bank_id`
       - `memo` (best-effort): `Payment.invoiceNumber` or `Payment.description`
  5. Persists OSN results:
     - Creates `PaymentProviderTransfer` with request/response snapshots and OSN ids
     - Updates `Payment`:
       - `providerTransfers` appends a ref
       - `activeProviderTransferId` set
       - sets `payment.method = 'OSN_ONRAMP'`

### Step 2: Buyer submits fiat deposit bank transaction reference
- UI action calls:
  - `POST /transfers/:id/bank-tx-number` with `bankTxNumber`
- Backend path:
  - `TransfersController.submitBankTxNumber()` -> `PaymentsService.submitBankTxNumber()`
- Backend behavior:
  1. Validates permissions (actor user or payment buyer).
  2. Requires `transfer.providerMintRequestId` (must exist from mint request creation).
  3. Calls OSN:
     - `POST /api/v4/users/me/minting/submit`
     - Sends:
       - `settlement_request_id = providerMintRequestId`
       - `bank_tx_number = bankTxNumber`
  4. Updates `PaymentProviderTransfer`:
     - `bankTxNumber` set
     - `providerStatus` set to `'bank_tx_submitted'`
     - merges OSN submit response into `transfer.response`

## Are we calculating fees when creating a mint request?

No local fee calculation is performed in TruMarket.

When creating the OSN mint request:
- OSN returns `estimated_fees` in the `POST /api/v4/users/me/minting/request` response.
- We persist that OSN-provided value into:
  - `PaymentProviderTransfer.estimatedFees`

If later we add a separate fee endpoint/polling, we can re-sync from OSN; currently we rely on the mint request response.

## OSN lookup/sync helpers (not used by core flows yet)

The backend exposes OSN lookup methods (protected by `AuthenticatedRestricted`):
- `GET /osn/organization-banks`
- `GET /osn/recipients`
- `GET /osn/wallets/organization`

These exist to support future admin/onboarding UX. The core mint/bank flows currently use:
- OSN org bank creation + OSN response mapping for buyers
- OSN mint request + response persistence for payments

