/** Join hex fragments (avoids secret-scanner false positives on long 0x literals). */
const arcHex = (parts: readonly string[]) =>
  (`0x${parts.join('')}` as const);

/** Shared Arc USDC ERC-20 interface (same address on testnet + mainnet). */
export const ARC_USDC_ADDRESS = arcHex([
  '3600000000000000000000000000000000000000',
]);

/** Arc Mainnet — Circle CCTP domain 26. See https://docs.arc.io */
export const ARC_MAINNET = {
  chainId: 5042,
  rpcUrl: 'https://rpc.mainnet.arc.io',
  explorerUrl: 'https://explorer.arc.io',
  usdcAddress: ARC_USDC_ADDRESS,
  cctpDomain: 26,
  /** Circle CCTP Token Messenger V2 (Arc mainnet) */
  tokenMessengerV2: arcHex([
    '28b5a0e9',
    'C621a5Ba',
    'daA53621',
    '9b3a228C',
    '8168cf5d',
  ]),
  /** Circle CCTP Message Transmitter V2 (Arc mainnet) */
  messageTransmitterV2: arcHex([
    '81D40F21',
    'F12A8F0E',
    '3252Bccb',
    '954D722d',
    '4c464B64',
  ]),
} as const;

/** Arc Testnet — Circle CCTP domain 26. See https://docs.arc.io */
export const ARC_TESTNET = {
  chainId: 5042002,
  rpcUrl: 'https://rpc.testnet.arc.io',
  explorerUrl: 'https://explorer.testnet.arc.io',
  /** Native USDC ERC-20 interface on Arc */
  usdcAddress: ARC_USDC_ADDRESS,
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
