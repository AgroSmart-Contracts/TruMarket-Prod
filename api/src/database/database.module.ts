import { Module } from '@nestjs/common';

import { providers } from '@/constants';
import { DealsMongooseRepository } from '@/infra/database/deals.repository';
import { KYCVerificationMongooseRepository } from '@/infra/database/kyc.repository';
import { NotificationsMongooseRepository } from '@/infra/database/notifications.repository';
import { UsersMongooseRepository } from '@/infra/database/users.repository';

const DealsRepositoryProvider = {
  provide: providers.DealsRepository,
  useClass: DealsMongooseRepository,
};

const UsersRepositoryProvider = {
  provide: providers.UsersRepository,
  useClass: UsersMongooseRepository,
};

const KYCRepositoryProvider = {
  provide: providers.KYCRepository,
  useClass: KYCVerificationMongooseRepository,
};

const NotificationsRepositoryProvider = {
  provide: providers.NotificationsRepository,
  useClass: NotificationsMongooseRepository,
};

const repos = [
  DealsRepositoryProvider,
  UsersRepositoryProvider,
  KYCRepositoryProvider,
  NotificationsRepositoryProvider,
];

@Module({
  providers: repos,
  exports: repos,
  imports: [],
})
export class DatabaseModule {}
