import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { OsnModule } from '@/osn/osn.module';
import { OsnRuntimeSettingsModule } from '@/settings/osn-runtime-settings.module';

import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsSyncScheduler } from './bank-accounts-sync.scheduler';

@Module({
  imports: [
    DatabaseModule,
    OsnModule,
    OsnRuntimeSettingsModule,
    NotificationsModule,
  ],
  controllers: [BankAccountsController],
  providers: [BankAccountsService, BankAccountsSyncScheduler],
  exports: [BankAccountsService],
})
export class BankAccountsModule {}
