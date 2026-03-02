import {
  createPublicClient,
  formatUnits,
  http,
  parseAbi,
  PublicClient,
} from 'viem';

import { config } from '@/config';

import DealsLogs from '../deals-logs/deals-logs.model';
import SyncDealsLogsJob, {
  DealsLogsJobType,
} from '../deals-logs/sync-deals-logs-job.model';
import { logger } from '../logger';

type DealLog = {
  dealId?: number;
  event: string;
  args: any;
  blockNumber: number;
  blockTimestamp: Date;
  txHash: string;
  message: string;
};

async function getDealsManagerLogs(
  client: PublicClient,
  fromBlock: bigint,
  toBlock: bigint,
  contractAddress: string,
): Promise<DealLog[]> {
  const logs = await client.getLogs({
    fromBlock,
    toBlock,
    address: contractAddress as `0x${string}`,
    events: parseAbi([
      `event DealCreated(uint256 dealId)`,
      `event DealMilestoneChanged(uint256 dealId, uint8 milestone)`,
      `event DealCompleted(uint256 dealId)`,
    ]),
  });

  const dealsLogs = logs.map((log) => {
    const dealLog: DealLog = {
      dealId: +log.args.dealId.toString(),
      event: log.eventName,
      args: log.args,
      blockNumber: +log.blockNumber.toString(),
      blockTimestamp: new Date(),
      txHash: log.transactionHash,
      message: '',
    };

    switch (log.eventName) {
      case 'DealCreated':
        dealLog.message = 'Deal created.';
        break;
      case 'DealCompleted':
        dealLog.message = 'Deal completed.';
        break;
      case 'DealMilestoneChanged':
        dealLog.message = `Deal status changed to milestone ${log.args.milestone}.`;
        break;
    }

    return dealLog;
  });

  return dealsLogs;
}

async function getDealVaultLogs(
  client: PublicClient,
  fromBlock: bigint,
  toBlock: bigint,
  contractAddress: string,
): Promise<DealLog[]> {
  const logs = await client.getLogs({
    fromBlock,
    toBlock,
    address: config.investmentTokenContractAddress as `0x${string}`,
    events: parseAbi([
      `event Transfer(address indexed from, address indexed to, uint256 value)`,
    ]),
  });

  const filteredLogs = logs.filter(
    (log) =>
      log.args.from.toLowerCase() === contractAddress.toLowerCase() ||
      log.args.to.toLowerCase() === contractAddress.toLowerCase(),
  );

  const dealsLogs = filteredLogs.map((log) => {
    const dealLog: DealLog = {
      event: log.eventName,
      args: log.args,
      blockNumber: +log.blockNumber.toString(),
      blockTimestamp: new Date(),
      txHash: log.transactionHash,
      message: '',
    };

    if (log.args.from.toLowerCase() === contractAddress.toLowerCase()) {
      dealLog.message = `${log.args.to} reclaimed ${formatUnits(log.args.value, config.investmentTokenDecimals ? +config.investmentTokenDecimals : 18)} tokens.`;
    } else {
      dealLog.message = `${log.args.from} deposited ${formatUnits(log.args.value, config.investmentTokenDecimals ? +config.investmentTokenDecimals : 18)} tokens.`;
    }

    return dealLog;
  });

  return dealsLogs;
}

export const syncDealsLogs = async () => {
  // DISABLED: This function is disabled to reduce Alchemy RPC usage.
  // The code is kept for future use but will not execute any RPC calls.
  logger.debug('Syncing deals logs (DISABLED - no-op)');
  return;

  const jobs = await SyncDealsLogsJob.find({ active: true });

  if (!jobs.length) {
    const job = await SyncDealsLogsJob.create({
      contract: config.dealsManagerContractAddress,
      lastBlock: 0,
      type: DealsLogsJobType.DealsManager,
    });
    jobs.push(job);
  }

  let fromBlock: bigint;
  let toBlock: bigint;
  let client: PublicClient;

  try {
    client = createPublicClient({
      transport: http(config.blockchainRpcUrl as string),
    }) as any;

    toBlock = await client.getBlockNumber();

    logger.debug({ fromBlock, toBlock }, 'got block number');
  } catch (err) {
    logger.error(err, 'Error syncing deals logs');
  }

  await Promise.all(
    jobs.map(async (job) => {
      try {
        fromBlock = job.lastBlock ? BigInt(job.lastBlock + 1) : BigInt('0');

        if (fromBlock > toBlock) {
          return;
        }

        logger.debug({ contract: job.contract }, 'Syncing deals logs');

        let dealsLogs: DealLog[] = [];

        logger.debug(
          {
            fromBlock,
            toBlock,
            type: job.type,
            contractAddress: job.contract,
          },
          'syncing deals logs from deals contract',
        );

        switch (job.type) {
          case DealsLogsJobType.DealsManager:
            console.log('getting deals manager logs');
            dealsLogs = await getDealsManagerLogs(
              client,
              fromBlock,
              toBlock,
              job.contract,
            );
            break;
          case DealsLogsJobType.Vault:
            dealsLogs = await getDealVaultLogs(
              client,
              fromBlock,
              toBlock,
              job.contract,
            );

            if (job.dealId !== undefined && job.dealId !== null) {
              dealsLogs = dealsLogs.map((dealLog) => ({
                dealId: job.dealId,
                ...dealLog,
              }));
            }
            break;
          default:
            console.warn('(syncDealsLogs) Unknown job type:', job.type);
            break;
        }

        if (dealsLogs.length) {
          await DealsLogs.create(dealsLogs);
        }

        await SyncDealsLogsJob.findByIdAndUpdate(job._id, {
          $set: {
            lastBlock: +toBlock.toString(),
            lastExecution: new Date(),
            lastStatus: 'success',
            error: '',
          },
        });
      } catch (err) {
        await SyncDealsLogsJob.findByIdAndUpdate(job._id, {
          $set: {
            lastExecution: new Date(),
            lastStatus: 'failed',
            error: err.message,
          },
        });
      }
    }),
  );
};
