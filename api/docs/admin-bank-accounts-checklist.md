## Admin checklist: bank accounts + payments verification

### Bank accounts (PENDING_APPROVAL → ACTIVE)

- **Creation (user app)**: buyer submits `POST /bank-accounts` → record created as `PENDING_APPROVAL`.
- **Provider processing (OSN)**: an out-of-band provider call (to be implemented) creates the org bank account and returns `providerAccountId`.
- **Activation (admin/system step)**:
  - Update the `BankAccount` record:
    - set `status=ACTIVE`
    - set `isActive=true` (optional mirror)
    - persist `providerAccountId` from OSN response
  - Optionally enforce default selection:
    - Only `ACTIVE` accounts can have `isDefault=true`
    - Ensure only one default per user+provider among `archived=false`
- **Archiving old accounts**: when a user “updates” an account, create a new record with `supersedesId` and later set the old record `archived=true` (no “Superseded” status in UI).

### Payment documents verification (existing flow)

- **Supplier uploads documents**: `POST /deals/:dealId/payments/:paymentId/documents`
- **Status progression**:
  - `payment_requested` → `in_progress` (currently auto-advanced in code)
  - `in_progress` → `verifying_documents` when required doc types are uploaded
  - Admin verifies documents and marks payment `completed` (admin flow remains unchanged)

### OSN on-ramp mint requests (buyer-initiated)

- **Buyer initiates mint request**: `POST /payments/:id/osn/mint-request`
  - Creates a `PaymentProviderTransfer` with:
    - `paymentId` = the TruMarket `Payment.id` used in this route (`:id`)
    - `initiatorUserId` (in code this is stored as `actorUserId`) = the TruMarket user who initiated it
    - request/response snapshots
- **Buyer submits bank transfer reference**: `POST /transfers/:id/bank-tx-number`

