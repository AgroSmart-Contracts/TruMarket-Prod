import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as schedule from 'node-schedule';

import { logger } from '@/logger';

import { BankAccountsService } from './bank-accounts.service';

@Injectable()
export class BankAccountsSyncScheduler implements OnModuleInit, OnModuleDestroy {
  private job: schedule.Job | null = null;

  constructor(private readonly bankAccountsService: BankAccountsService) {}

  onModuleInit() {
    // Keep disabled in tests to avoid noisy async jobs.
    if (process.env.NODE_ENV === 'test') return;

    const cronExpr =
      process.env.BANK_ACCOUNTS_SYNC_CRON || '*/2 * * * *'; // default every 2 minutes

    this.job = schedule.scheduleJob(cronExpr, async () => {
      try {
        const result = await this.bankAccountsService.syncOsnOrganizationBanks({
          pendingOnly: true,
        });
        logger.debug(
          { result },
          'Bank account OSN sync scheduler completed',
        );
      } catch (err) {
        logger.warn({ err }, 'Bank account OSN sync scheduler failed');
      }
    });
  }

  onModuleDestroy() {
    if (this.job) {
      this.job.cancel();
      this.job = null;
    }
  }
}

