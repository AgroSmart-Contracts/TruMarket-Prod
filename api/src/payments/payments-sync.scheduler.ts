import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as schedule from 'node-schedule';

import { logger } from '@/logger';

import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentsSyncScheduler implements OnModuleInit, OnModuleDestroy {
  private job: schedule.Job | null = null;

  constructor(private readonly paymentsService: PaymentsService) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') return;

    const cronExpr = process.env.PAYMENTS_OSN_SYNC_CRON || '*/2 * * * *';

    this.job = schedule.scheduleJob(cronExpr, async () => {
      try {
        const result = await this.paymentsService.syncOsnPaymentStatusesFromProvider();
        logger.debug({ result }, 'Payments OSN status sync scheduler completed');
      } catch (err) {
        logger.warn({ err }, 'Payments OSN status sync scheduler failed');
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
