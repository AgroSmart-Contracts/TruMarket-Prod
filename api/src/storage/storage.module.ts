import { Module } from '@nestjs/common';

import { DealsModule } from '@/deals/deals.module';

import { StorageController } from './storage.controller';

@Module({
  imports: [DealsModule],
  controllers: [StorageController],
})
export class StorageModule {}
