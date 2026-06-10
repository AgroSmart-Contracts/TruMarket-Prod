import type { IProvider } from "@web3auth/base";
import { BrowserProvider, type JsonRpcSigner } from "ethers";

import { chainConfigDeal } from "./chain-configs";
import { dealChainEnv } from "./deal-chain-env";

function toChainIdHex(chainId: string): string {
  if (!chainId) {
    throw new Error("Deal chain id is not configured (NEXT_PUBLIC_DEAL_CHAIN_ID)");
  }
  if (chainId.startsWith("0x")) {
    return chainId;
  }
  return `0x${Number(chainId).toString(16)}`;
}

/** Switch Web3Auth provider to the deal chain before contract calls. */
export async function ensureDealChain(provider: IProvider): Promise<void> {
  const chainIdHex = toChainIdHex(dealChainEnv.chainId);

  const addChainParams = {
    chainId: chainIdHex,
    chainName: chainConfigDeal.displayName || "Deal chain",
    rpcUrls: [dealChainEnv.rpcUrl],
    blockExplorerUrls: dealChainEnv.explorer ? [dealChainEnv.explorer] : [],
    nativeCurrency: {
      name: chainConfigDeal.tickerName || chainConfigDeal.ticker || "ETH",
      symbol: chainConfigDeal.ticker || "ETH",
      decimals: 18,
    },
  };

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error: unknown) {
    const switchError = error as { code?: number };
    if (switchError.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [addChainParams],
      });
      return;
    }
    throw error;
  }
}

export async function getDealChainSigner(
  privateKeyProvider: IProvider,
): Promise<JsonRpcSigner> {
  await ensureDealChain(privateKeyProvider);
  const provider = new BrowserProvider(privateKeyProvider as any);
  return provider.getSigner();
}

export async function getDealChainProvider(
  privateKeyProvider: IProvider,
): Promise<BrowserProvider> {
  await ensureDealChain(privateKeyProvider);
  return new BrowserProvider(privateKeyProvider as any);
}
