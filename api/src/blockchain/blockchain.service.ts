import { Inject, Injectable } from '@nestjs/common';
import {
  parseAbi,
  parseEventLogs,
  parseUnits,
  PublicClient,
  verifyMessage,
} from 'viem';

import { config } from '@/config';

import { InternalServerError } from '../errors';

@Injectable()
export class BlockchainService {
  constructor(
    @Inject('DealsManager')
    private dealsManager: any,
    @Inject('PublicClient')
    private publicClient: PublicClient,
  ) { }

  async getLastBlock(): Promise<number> {
    const blockNumber = await this.publicClient.getBlockNumber();
    return Number(blockNumber);
  }

  async getNftID(txHash: string): Promise<number> {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    const logs = parseEventLogs({
      abi: parseAbi([
        `event DealCreated(uint256 indexed dealId, address indexed borrower, uint256 maxDeposit)`,
      ]),
      eventName: 'DealCreated',
      logs: receipt.logs,
    });

    if (!logs.length) {
      throw new InternalServerError('no deal created event was emitted');
    }

    return Number(logs[0].args.dealId);
  }

  async vault(nftID: number): Promise<string> {
    return this.dealsManager.read.vault([nftID]);
  }

  async mintNFT(
    distributions: number[],
    maxDeposit: number,
    borrower: string,
  ): Promise<string> {
    const tx = await this.dealsManager.write.mint([
      distributions,
      parseUnits('' + maxDeposit, +config.investmentTokenDecimals),
      borrower,
    ]);

    await this.waitForTx(tx);

    return tx;
  }

  async waitForTx(txHash: `0x${string}`): Promise<void> {
    await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
  }

  async changeMilestoneStatus(
    nftId: number,
    milestone: number,
  ): Promise<string> {
    const tx = await this.dealsManager.write.proceed([nftId, milestone]);

    await this.waitForTx(tx);

    return tx;
  }

  async verifyMessage(
    walletAddress: `0x${string}`,
    message: string,
    signature: `0x${string}`,
  ): Promise<boolean> {
    return verifyMessage({
      address: walletAddress,
      message: message,
      signature: signature,
    });
  }

  async setDealAsCompleted(nftId: number): Promise<string> {
    const tx = await this.dealsManager.write.setDealCompleted([nftId]);

    await this.waitForTx(tx);

    return tx;
  }
}
