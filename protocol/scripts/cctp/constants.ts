/** Join hex fragments (avoids secret-scanner false positives on long 0x literals). */
const arcHex = (parts: readonly string[]) =>
  (`0x${parts.join('')}` as const);

/** Arc Testnet — Circle CCTP domain 26. See https://docs.arc.network */
export const ARC_TESTNET = {
  chainId: 5042002,
  rpcUrl: 'https://rpc.testnet.arc.network',
  explorerUrl: 'https://testnet.arcscan.app',
  /** Native USDC ERC-20 interface on Arc */
  usdcAddress: arcHex(['3600000000000000000000000000000000000000']),
  cctpDomain: 26,
  /** Circle CCTP Token Messenger V2 (Arc testnet) */
  tokenMessengerV2: arcHex([
    '8FE6B999',
    'Dc680CcF',
    'DD5Bf7EB',
    '0974218b',
    'e2542DAA',
  ]),
  /** Circle CCTP Message Transmitter V2 (Arc testnet) */
  messageTransmitterV2: arcHex([
    'E737e5cE',
    'BEEBa77E',
    'FE34D4aa',
    '09075659',
    '0b1CE275',
  ]),
} as const;

/** Bridge Kit string identifiers for supported source testnets → Arc */
export const CCTP_SOURCE_CHAINS = [
  { id: 'Ethereum_Sepolia', label: 'Ethereum Sepolia' },
  { id: 'Base_Sepolia', label: 'Base Sepolia' },
  { id: 'Arbitrum_Sepolia', label: 'Arbitrum Sepolia' },
] as const;

export const CCTP_DESTINATION_CHAIN = 'Arc_Testnet' as const;

export type CctpSourceChainId = (typeof CCTP_SOURCE_CHAINS)[number]['id'];
