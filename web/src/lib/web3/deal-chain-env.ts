const dealDecimals =
  process.env.NEXT_PUBLIC_DEAL_INVESTMENT_TOKEN_DECIMALS ||
  process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS ||
  "6";

export const dealChainEnv = {
  chainId:
    process.env.NEXT_PUBLIC_DEAL_CHAIN_ID ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID ||
    "",
  rpcUrl:
    process.env.NEXT_PUBLIC_DEAL_CHAIN_RPC_URL ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL ||
    "",
  explorer:
    process.env.NEXT_PUBLIC_DEAL_CHAIN_EXPLORER ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER ||
    "",
  dealsManagerAddress:
    process.env.NEXT_PUBLIC_DEAL_NFT_CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
    "",
  usdcAddress:
    process.env.NEXT_PUBLIC_DEAL_INVESTMENT_TOKEN_CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS ||
    "",
  usdcSymbol:
    process.env.NEXT_PUBLIC_DEAL_INVESTMENT_TOKEN_SYMBOL ||
    process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL ||
    "USDC",
  usdcDecimals: +dealDecimals,
};
