# Checklist

0. Deploy `DealVaultFactory` + `DealsManager` on Arc (`protocol`: `npm run deploy:arc:mainnet` or `npm run deploy:arc`)
1. Update contract address in the API app (`DEALS_MANAGER_CONTRACT_ADDRESS` / `DEAL_CHAIN_*` — see `api/.env.example`)
2. Update contract address in the web app (`NEXT_PUBLIC_DEAL_NFT_CONTRACT_ADDRESS` / `NEXT_PUBLIC_DEAL_*` — see `web/.env.example`; rebuild bundle)
3. Sync DealsManager ABI from `protocol` artifacts into `api/src/blockchain/dealsManager.abi.ts` and `web/.../DealsManager.abi.ts` when Solidity changes
4. Change contract address in `syncdealslogsjobs` collection in mongo if re-indexing events

## Current Arc mainnet (Circle grant M2)

| Contract | Address |
|----------|---------|
| DealVaultFactory | `0x5Dacdbb79A558f9395367badDc6d351053D58B08` |
| DealsManager | `0x0F1a18BE854e9924158474fB6828287eAB10F6F6` |
| USDC | `0x3600000000000000000000000000000000000000` |
| Chain ID | `5042` |
| RPC | `https://rpc.mainnet.arc.io` |
| Explorer | https://explorer.arc.io/address/0x0F1a18BE854e9924158474fB6828287eAB10F6F6 |

## Current Arc testnet (post–Octane)

| Contract | Address |
|----------|---------|
| DealVaultFactory | `0x4Ff7e80bE6D7776d626Ea8dD7FB896041732B0C4` |
| DealsManager | `0xfA3D35C236CFe644786e9B360706eB97CF2836A7` |
| Chain ID | `5042002` |
