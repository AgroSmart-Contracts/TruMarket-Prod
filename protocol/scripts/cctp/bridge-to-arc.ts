import 'dotenv/config';

import { BridgeKit } from '@circle-fin/bridge-kit';
import { createViemAdapterFromPrivateKey } from '@circle-fin/adapter-viem-v2';

import {
  CCTP_DESTINATION_CHAIN,
  CCTP_SOURCE_CHAINS,
  type CctpSourceChainId,
} from './constants';

function parseArgs(): { source: CctpSourceChainId; amount: string } {
  const source = (process.env.CCTP_SOURCE_CHAIN ||
    process.argv[2] ||
    'Base_Sepolia') as CctpSourceChainId;
  const amount = process.env.CCTP_AMOUNT || process.argv[3] || '1.00';

  const valid = CCTP_SOURCE_CHAINS.some((c) => c.id === source);
  if (!valid) {
    throw new Error(
      `Invalid source chain "${source}". Use one of: ${CCTP_SOURCE_CHAINS.map((c) => c.id).join(', ')}`,
    );
  }

  return { source, amount };
}

/**
 * Bridge USDC from a supported testnet to Arc Testnet via Circle Bridge Kit (CCTP v2).
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx ts-node scripts/cctp/bridge-to-arc.ts Base_Sepolia 5.00
 *   CCTP_SOURCE_CHAIN=Ethereum_Sepolia CCTP_AMOUNT=2 npm run bridge:arc
 */
export async function bridgeUsdcToArc(options?: {
  privateKey?: string;
  source?: CctpSourceChainId;
  amount?: string;
  recipientAddress?: string;
}): Promise<unknown> {
  const privateKey =
    options?.privateKey || process.env.PRIVATE_KEY || process.env.BLOCKCHAIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Set PRIVATE_KEY or BLOCKCHAIN_PRIVATE_KEY');
  }

  const parsed = parseArgs();
  const source = options?.source || parsed.source;
  const amount = options?.amount || parsed.amount;

  const kit = new BridgeKit();
  const adapter = createViemAdapterFromPrivateKey({
    privateKey: privateKey as `0x${string}`,
  });

  console.log(`Bridging ${amount} USDC: ${source} → ${CCTP_DESTINATION_CHAIN}`);
  console.log('Submitting bridge (burn → attestation → mint on Arc)…');

  const result = await kit.bridge({
    from: { adapter, chain: source },
    to: {
      adapter,
      chain: CCTP_DESTINATION_CHAIN,
      useForwarder: true,
      ...(options?.recipientAddress
        ? { recipientAddress: options.recipientAddress as `0x${string}` }
        : {}),
    },
    amount,
  });

  console.log('Bridge complete:', JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) {
  bridgeUsdcToArc()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
