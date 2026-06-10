import { Module } from '@nestjs/common';

import { AdminDashboardFeeQuoteService } from '@/admin-dashboard/admin-dashboard-fee-quote.service';
import { DatabaseModule } from '@/database/database.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { OsnModule } from '@/osn/osn.module';
import { OsnRuntimeSettingsModule } from '@/settings/osn-runtime-settings.module';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsPublicController } from './payments-public.controller';
import { PaymentsSyncScheduler } from './payments-sync.scheduler';
import { TransfersController } from './transfers.controller';

@Module({
  imports: [
    DatabaseModule,
    OsnModule,
    OsnRuntimeSettingsModule,
    NotificationsModule,
  ],
  controllers: [
    PaymentsController,
    PaymentsPublicController,
    TransfersController,
  ],
  providers: [
    PaymentsService,
    AdminDashboardFeeQuoteService,
    PaymentsSyncScheduler,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
