# TruMarket response to Olympix BugPoCer scan and mutation testing

**Scan:** BugPoCer Full Scan, 23 October 2026
**Audited code:** `protocol/contracts/` on `main` at `4ac7be4` (report lists commit as "unknown"; line numbers match this commit)
**Fixes:** branch `fix/olympix-bugpocer-findings` (commits per finding below)
**Deployment:** Arc mainnet, DealsManager `0x0F1a18BE854e9924158474fB6828287eAB10F6F6`

## Context

- **No Arc vault has DLS shares.** `mint` pauses and blocks deposits on every vault. Our backend only calls `mint` and `setDealCompleted`; it never calls `reopenVault`, `unblockVaultDeposits` or `transferFromVault`. So `totalSupply()` is 0 on every vault.
- **The legacy deposit path is unused on Arc.** All Arc deals are v2.0, funded through the Lagoon pool.

Most findings require the owner to call `unblockVaultDeposits`. We removed it (and the now-redundant `blockVaultDeposits`), which closes 5.1.1, 5.2.2, 5.2.6 and 5.2.7 at the root.

Contracts are not upgradeable, so the fixes take effect with the next DealsManager / DealVaultFactory deployment.

## Summary

| ID | Finding | Severity | Status | Commit |
|---|---|---|---|---|
| 5.1.1 | Donated repayments redeemable by DLS holders | Medium | Fixed | `c0dc395` |
| 5.2.1 | No forwarders for vault pause/setMinDeposit | Low | Fixed | `c0dc395` |
| 5.2.2 | Share dilution when deposits reopen after disbursement | Low | Fixed (via 5.1.1) | `c0dc395` |
| 5.2.3 | maxDeposit/maxMint ignore minimum deposit | Low | Fixed | `bb19b06` |
| 5.2.4 | Owner can sweep vault USDC backing shares | Low | By design | - |
| 5.2.5 | renounceOwnership bypasses zero-owner guard | Low | Fixed | `e3306ad` |
| 5.2.6 | Principal counter drift | Low | Fixed (via 5.1.1) | `c0dc395` |
| 5.2.7 | reopenVault does not enforce blocked deposits | Low | Fixed | `c0dc395` |
| 5.2.8 | Completion gate uses raw balance | Low | Acknowledged | `c0dc395` (`pauseVault`) |
| 5.2.9 | Permissionless factory, spoofed vaults | Low | Fixed | `bd9a58f` |

## Findings

**5.1.1 Donated repayments redeemable by DLS holders: Fixed.**
The PoC is valid. It requires the owner to call `reopenVault` and `unblockVaultDeposits`, which has never happened on Arc, so we rate it Low in practice. We removed `unblockVaultDeposits`, so DealsManager vaults can never accept deposits after `mint`. The PoC is adapted as a regression test (`test/poc.bugpocer.test.ts`): the attacker's deposit now reverts and the repayment stays in the vault. Applies to 5.1.1b too.

**5.2.1 No forwarders for pause/setMinDeposit: Fixed.**
Valid docs/code mismatch. Added `pauseVault(tokenId)`. Since deposits are permanently blocked, `setMinDeposit` has no effect on DealsManager vaults, so we removed the claim from the README instead of adding a forwarder.

**5.2.2 Share dilution after disbursement: Fixed (via 5.1.1).**
This was listed in our README as a known risk. With deposits permanently blocked, it is unreachable.

**5.2.3 maxDeposit/maxMint ignore minimum deposit: Fixed.**
Valid EIP-4626 deviation. Both now return 0 when headroom is below `_minDeposit`.

**5.2.4 Owner can sweep vault USDC: By design.**
Documented in our trust model: the owner is fully trusted and routes repayments to the Lagoon pool off-chain via `transferFromVault`. No share holders exist to be affected.

**5.2.5 renounceOwnership: Fixed.**
`renounceOwnership` now always reverts.

**5.2.6 Principal counter drift: Fixed (via 5.1.1).**
Matches the invariant we confirmed in context validation. Only relevant while deposits are open, which can no longer happen.

**5.2.7 reopenVault postcondition: Fixed.**
`reopenVault` now calls `blockDeposits()` before `unpause()`.

**5.2.8 Completion gate uses raw balance: Acknowledged.**
Valid, but with zero supply and blocked deposits an unpause exposes nothing; the attacker only loses the transferred USDC. The owner can now reverse it with `pauseVault`.

**5.2.9 Permissionless factory: Fixed.**
`DealVaultFactory` is now bound at construction to one DealsManager, which is the only allowed caller and always the vault owner. DealsManager's constructor checks the binding. We also removed the leftover constructor `approve` and corrected the NatSpec and `DEPLOY-ARC.md`.

## Mutation testing

92 mutants, 43 killed, 49 survived. We rewrote the test suite (32 to 64 tests) in `b6231de`.

| Group | Survived | Response |
|---|---|---|
| `onlyOwner` removed | 15 | Added non-owner revert tests for every owner-only function. |
| Event emit removed | 13 | Added `emit(...).withArgs(...)` assertions. |
| `nonReentrant` removed | 11 | Added a callback token (`ReentrantERC20Mock`) and reentrancy tests for vault `deposit`, `mint`, `redeem`, `withdraw` and `DealsManager.donateToDeal`. The other 6 guards sit behind `onlyOwner`, which rejects the reentrant caller first, so they are equivalent mutants. |
| Logic / value | 10 | Added targeted tests: zero-owner transfer, unknown `tokenId` on views, exact first-deposit shares (offset), `maxDeposit` / `maxMint` with non-zero principal, `maxWithdraw` / `maxRedeem` paused vs unpaused, partial redeem / withdraw principal, `setMinDeposit` bound. |

Legacy vault paths are now tested on vaults deployed directly with a test owner, since DealsManager vaults can no longer open deposits. We would welcome a mutation re-run on the branch head.
