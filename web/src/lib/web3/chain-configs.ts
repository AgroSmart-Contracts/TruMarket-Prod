import { CHAIN_NAMESPACES } from "@web3auth/base";

export const chainConfigEth = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || "",
  rpcTarget: process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || "",
  displayName: process.env.NEXT_PUBLIC_BLOCKCHAIN_NAME,
  blockExplorer: process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER,
  ticker: process.env.NEXT_PUBLIC_BLOCKCHAIN_TICKER,
  tickerName: process.env.NEXT_PUBLIC_BLOCKCHAIN_TICKER_NAME,
};