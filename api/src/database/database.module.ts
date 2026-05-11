import { Module } from '@nestjs/common';

import { providers } from '@/constants';
import { DealsMongooseRepository } from '@/infra/database/deals.repository';
import { BankAccountsMongooseRepository } from '@/infra/database/bank-accounts.repository';
import { NotificationsMongooseRepository } from '@/infra/database/notifications.repository';
import { PaymentProviderTransfersMongooseRepository } from '@/infra/database/payment-provider-transfers.repository';
import { PaymentsMongooseRepository } from '@/infra/database/payments.repository';
import { UsersMongooseRepository } from '@/infra/database/users.repository';
import { TruMarketSettingsMongooseRepository } from '@/infra/database/trumarket-settings.repository';

const DealsRepositoryProvider = {
  provide: providers.DealsRepository,
  useClass: DealsMongooseRepository,
};

const UsersRepositoryProvider = {
  provide: providers.UsersRepository,
  useClass: UsersMongooseRepository,
};

const NotificationsRepositoryProvider = {
  provide: providers.NotificationsRepository,
  useClass: NotificationsMongooseRepository,
};

const PaymentsRepositoryProvider = {
  provide: providers.PaymentsRepository,
  useClass: PaymentsMongooseRepository,
};

const BankAccountsRepositoryProvider = {
  provide: providers.BankAccountsRepository,
  useClass: BankAccountsMongooseRepository,
};

const PaymentProviderTransfersRepositoryProvider = {
  provide: providers.PaymentProviderTransfersRepository,
  useClass: PaymentProviderTransfersMongooseRepository,
};

const TruMarketSettingsRepositoryProvider = {
  provide: providers.TruMarketSettingsRepository,
  useClass: TruMarketSettingsMongooseRepository,
};

const repos = [
  DealsRepositoryProvider,
  UsersRepositoryProvider,
  NotificationsRepositoryProvider,
  PaymentsRepositoryProvider,
  BankAccountsRepositoryProvider,
  PaymentProviderTransfersRepositoryProvider,
  TruMarketSettingsRepositoryProvider,
];

@Module({
  providers: repos,
  exports: repos,
  imports: [],
})
export class DatabaseModule {}
