import { Module } from '@nestjs/common';

import { AdminDashboardOsnRuntimeService } from '@/admin-dashboard/admin-dashboard-osn-runtime.service';
import { DatabaseModule } from '@/database/database.module';

import { OsnRuntimeSettingsController } from './osn-runtime-settings.controller';
import { OsnRuntimeSettingsService } from './osn-runtime-settings.service';

@Module({
  imports: [DatabaseModule],
  controllers: [OsnRuntimeSettingsController],
  providers: [OsnRuntimeSettingsService, AdminDashboardOsnRuntimeService],
  exports: [OsnRuntimeSettingsService],
})
export class OsnRuntimeSettingsModule {}
