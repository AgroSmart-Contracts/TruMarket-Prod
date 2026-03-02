import { Module } from '@nestjs/common';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  getContract,
  http,
  PublicClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { config } from '../config';
import { BlockchainService } from './blockchain.service';
import { DEALS_MANAGER_ABI } from './dealsManager.abi';

@Module({
  controllers: [],
  providers: [
    BlockchainService,
    {
      provide: 'DealsManager',
      useFactory: async (): Promise<any> => {
        const account = privateKeyToAccount(
          config.blockchainPrivateKey as `0x${string}`,
        );

        const chain = defineChain({
          id: +config.blockchainChainId,
          name: 'testnet',
          nativeCurrency: {
            decimals: 18,
            name: 'Ether',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: [config.blockchainRpcUrl],
            },
          },
        });

        const writeClient = await createWalletClient({
          account,
          transport: http(config.blockchainRpcUrl),
          chain,
        });

        const publicClient = await createPublicClient({
          transport: http(config.blockchainRpcUrl),
        });

        return getContract({
          abi: DEALS_MANAGER_ABI.abi,
          address: config.dealsManagerContractAddress as `0x${string}`,
          client: { wallet: writeClient, public: publicClient } as any,
        });
      },
    },
    {
      provide: 'PublicClient',
      useFactory: async (): Promise<PublicClient> => {
        const client = await createPublicClient({
          transport: http(config.blockchainRpcUrl),
        });
        return client as PublicClient;
      },
    },
  ],
  exports: [BlockchainService],
})
export class BlockchainModule {}
