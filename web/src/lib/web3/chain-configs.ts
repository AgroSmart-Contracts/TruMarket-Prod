import { CHAIN_NAMESPACES } from "@web3auth/base";

/** Web3Auth wallet chain (user identity, balances, withdraw). */
export const chainConfigWallet = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || "",
  rpcTarget: process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || "",
  displayName: process.env.NEXT_PUBLIC_BLOCKCHAIN_NAME,
  blockExplorer: process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER,
  ticker: process.env.NEXT_PUBLIC_BLOCKCHAIN_TICKER,
  tickerName: process.env.NEXT_PUBLIC_BLOCKCHAIN_TICKER_NAME,
};

/** On-chain deals chain (DealsManager, DealVault, donateToDeal). */
export const chainConfigDeal = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId:
    process.env.NEXT_PUBLIC_DEAL_CHAIN_ID ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID ||
    "",
  rpcTarget:
    process.env.NEXT_PUBLIC_DEAL_CHAIN_RPC_URL ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL ||
    "",
  displayName:
    process.env.NEXT_PUBLIC_DEAL_CHAIN_NAME ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_NAME,
  blockExplorer:
    process.env.NEXT_PUBLIC_DEAL_CHAIN_EXPLORER ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER,
  ticker:
    process.env.NEXT_PUBLIC_DEAL_CHAIN_TICKER ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_TICKER,
  tickerName:
    process.env.NEXT_PUBLIC_DEAL_CHAIN_TICKER_NAME ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_TICKER_NAME,
};

/** @deprecated Use chainConfigWallet — kept for existing imports. */
export const chainConfigEth = chainConfigWallet;
