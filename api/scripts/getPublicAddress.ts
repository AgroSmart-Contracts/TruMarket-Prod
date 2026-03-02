import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';

const account = privateKeyToAccount(
  '0xe91d1e08333eb6e5ac05905ad77994df445e81213c49d59821f5b2ba8415b7f6',
);

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

const address = client.account.address;

console.log({ address });
