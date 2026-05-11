import { Module } from '@nestjs/common';

import { AdminDashboardOsnRuntimeService } from '@/admin-dashboard/admin-dashboard-osn-runtime.service';
import { DatabaseModule } from '@/database/database.module';

import { OsnRuntimeSettingsService } from './osn-runtime-settings.service';
import { OsnRuntimeSettingsController } from './osn-runtime-settings.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [OsnRuntimeSettingsController],
  providers: [OsnRuntimeSettingsService, AdminDashboardOsnRuntimeService],
  exports: [OsnRuntimeSettingsService],
})
export class OsnRuntimeSettingsModule {}

