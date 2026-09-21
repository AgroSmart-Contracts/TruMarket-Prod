/** Shared CCTP constants (mirrors protocol/scripts/cctp/constants.ts) */

export const ARC_MAINNET = {
  chainId: 5042,
  rpcUrl: 'https://rpc.mainnet.arc.io',
  explorerUrl: 'https://explorer.arc.io',
  usdcAddress: '0x3600000000000000000000000000000000000000',
} as const;

export const ARC_TESTNET = {
  chainId: 5042002,
  rpcUrl: 'https://rpc.testnet.arc.io',
  explorerUrl: 'https://explorer.testnet.arc.io',
  usdcAddress: '0x3600000000000000000000000000000000000000',
} as const;

export const CCTP_SOURCE_CHAINS = [
  { id: 'Ethereum_Sepolia', label: 'Ethereum Sepolia' },
  { id: 'Base_Sepolia', label: 'Base Sepolia' },
  { id: 'Arbitrum_Sepolia', label: 'Arbitrum Sepolia' },
] as const;

export const CCTP_DESTINATION_CHAIN = 'Arc_Testnet' as const;

export type CctpSourceChainId = (typeof CCTP_SOURCE_CHAINS)[number]['id'];
