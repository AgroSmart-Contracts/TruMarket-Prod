# Security audit context

This folder is the starting point for auditors and security scanners reviewing the TruMarket on-chain protocol. It covers scope, audit history, what the contracts are meant to do, the trust model, and the areas we most want reviewed.

## Scope

| File | Lines | In scope |
|------|-------|----------|
| `protocol/contracts/DealsManager.sol` | 239 | Yes |
| `protocol/contracts/DealVault.sol` | 393 | Yes |
| `protocol/contracts/DealVaultFactory.sol` | 18 | Yes |
| `protocol/contracts/interfaces/IDealVault.sol` | 20 | Yes |
| `protocol/contracts/ERC20Mock.sol` | 18 | No (test only) |

Everything outside `protocol/contracts/` (API, web app, scripts) is out of scope.

- Compiler: Solidity 0.8.24, optimizer enabled, 200 runs (`protocol/hardhat.config.ts`)
- Dependencies: OpenZeppelin Contracts v5
- Tests: `protocol/test/` (32 Hardhat tests, including an ERC-4626 inflation attack test). Run with `cd protocol && npm install && npx hardhat test`.

### Deployments

| Network | Chain ID | DealsManager | DealVaultFactory |
|---------|----------|--------------|------------------|
| Arc mainnet | 5042 | `0x0F1a18BE854e9924158474fB6828287eAB10F6F6` | `0x5Dacdbb79A558f9395367badDc6d351053D58B08` |
| Arc testnet | 5042002 | `0xfA3D35C236CFe644786e9B360706eB97CF2836A7` | `0x4Ff7e80bE6D7776d626Ea8dD7FB896041732B0C4` |

Underlying asset: Arc native USDC `0x3600000000000000000000000000000000000000` (6 decimals). Address files: `protocol/scripts/addresses/`.

## Previous audit

| Date | Reviewer | Covered | Status | Reference |
|------|----------|---------|--------|-----------|
| Sep 2026 | Octane (ERC-4626 review) | Share pricing with the virtual offset, rounding, capacity accounting, `max*` views | Fixed in `faee66d`, before the Arc mainnet deploy | [`CIRCLE-GRANT-MILESTONE-2-SUBMISSION.md`](../../docs/CIRCLE-GRANT-MILESTONE-2-SUBMISSION.md) section 4 |

The Octane fixes:
- `reopenVault` no longer unblocks deposits as a side effect.
- `mint` rounds the assets charged up, and `withdraw` rounds the shares burned up.
- Deposit capacity is checked against tracked principal (`_principalOutstanding`), not the raw balance, so donations or direct transfers cannot use up the headroom.
- `maxDeposit`, `maxMint`, `maxWithdraw` and `maxRedeem` return 0 while the vault is paused or deposit-blocked.

## What the contracts are for

TruMarket finances agricultural export shipments. Buyers (borrowers) and suppliers create deals in the TruMarket app. Since v2.0:

- Investor capital sits in a shared Lagoon liquidity pool (separate contracts, out of scope). TruMarket admins allocate pool capital to deals.
- Trade milestones and supplier payouts are tracked off-chain (API, MongoDB, AgroPay payment rail).
- These contracts provide **deal identity and borrower repayment** on-chain.

### Flow

1. The API (contract owner) calls `DealsManager.mint(maxDeposit, borrower)`. This mints an ERC-721 deal token, deploys a `DealVault` through `DealVaultFactory`, then pauses the vault and blocks its deposits straight away.
2. The borrower repays USDC with `DealsManager.donateToDeal(tokenId, amount)`. `DealsManager` pulls the USDC and forwards it to the vault via `DealVault.donate`.
3. The owner calls `setDealCompleted(tokenId)`. If the vault's assets exceed `maxDeposit`, the vault is unpaused through `complete()`.
4. The owner can move vault funds to the borrower or to itself with `transferFromVault(tokenId, amount, toBorrower)`.

### Legacy (v1.x) path

`DealVault.deposit`, `mint`, `redeem` and `withdraw` are the original per-deal investor flow. They are kept for compatibility with vaults from v1.x. For every deal minted on the current contracts, the vault is paused and deposit-blocked at mint, so these paths are frozen unless the owner deliberately reopens them.

More detail: [`protocol/README.md`](../README.md), [`protocol/docs/CIRCLE-GRANT-SMART-CONTRACT-FLOW.md`](../docs/CIRCLE-GRANT-SMART-CONTRACT-FLOW.md), diagrams in [`docs/grant-diagrams/`](../../docs/grant-diagrams/).

## Trust model and intended behaviour

These are design choices. Please do not report them as vulnerabilities unless the code behaves differently from what is described here.

- **The `DealsManager` owner is fully trusted.** It is currently an EOA held by the TruMarket API backend. It can mint deals, change a deal's borrower, pause and unpause vaults, block and unblock deposits, change the minimum deposit, and move any vault balance to the borrower or to itself via `transferFromVault`, even while vault shares are outstanding. Funds are routed by TruMarket off-chain, so this is intended.
- **Each `DealVault` is owned by its `DealsManager`.** `donate`, `complete`, `transferToBorrower`, `pause`, `unpause`, `blockDeposits`, `unblockDeposits` and `setMinDeposit` are owner-only.
- **Only the registered borrower can call `donateToDeal`** for a deal.
- **`DealVaultFactory.deploy` is permissionless.** Vaults deployed outside `DealsManager.mint` are not registered and have no effect on the protocol.
- **Only USDC is supported.** Fee-on-transfer, rebasing and callback tokens are out of scope.
- **`setDealCompleted` may mark a deal completed without unlocking the vault** when repayment has not exceeded `maxDeposit`. The deal state is then final, and the vault stays paused unless the owner calls `reopenVault`.
- **No on-chain milestone logic.** Milestone percentages, approvals and supplier payouts are off-chain.

## Areas we most want reviewed

1. ERC-4626 share pricing when a vault holds few assets but a large share supply (for example after `transferFromVault`), and what happens if the owner then calls `unblockVaultDeposits`.
2. Whether any non-owner can reach the legacy `deposit` / `mint` / `redeem` / `withdraw` paths on a vault that was paused and blocked at mint.
3. Whether `_principalOutstanding` can drift from real deposits through donations, direct transfers, or rounding in `redeem` / `withdraw`.
4. Any way to drain, lock, or grief a vault without being the owner or the borrower.
5. Correctness of `donateToDeal` (pull from borrower, approve vault, vault pulls from `DealsManager`).

## Known items

- `DealVault`'s constructor approves `msg.sender` for `maxDeposit`. At deploy time `msg.sender` is `DealVaultFactory`, which has no function that uses the allowance. It is a leftover from when `DealsManager` deployed vaults directly.
- Token calls use `IERC20.transfer` / `transferFrom` directly, not `SafeERC20`. This is acceptable for USDC, which reverts on failure.
