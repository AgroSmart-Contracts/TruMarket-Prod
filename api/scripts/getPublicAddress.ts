import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';

const account = privateKeyToAccount(
  process.env.BLOCKCHAIN_PRIVATE_KEY as `0x${string}`,
);

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

const address = client.account.address;

console.log({ address });
