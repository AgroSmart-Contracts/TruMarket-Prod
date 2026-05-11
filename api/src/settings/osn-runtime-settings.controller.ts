import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AdminAccessRestricted } from '@/decorators/adminRestricted';
import { TruMarketSettings } from '@/settings/trumarket-settings.entities';
import { OsnRuntimeSettingsService } from './osn-runtime-settings.service';
import type { OsnRuntimeSettingsResolved } from './osn-runtime-settings.types';

@ApiTags('Admin Settings')
@Controller('admin/settings')
export class OsnRuntimeSettingsController {
  constructor(private readonly service: OsnRuntimeSettingsService) {}

  @Get('osn')
  @AdminAccessRestricted()
  @ApiOperation({ summary: 'Get resolved OSN runtime defaults (DB primary, env fallback)' })
  @ApiResponse({ status: 200, type: Object })
  async getOsnRuntimeSettings(): Promise<OsnRuntimeSettingsResolved> {
    return this.service.getOsnRuntimeSettings();
  }

  @Put('osn')
  @AdminAccessRestricted()
  @ApiOperation({ summary: 'Upsert OSN runtime defaults in DB (primary source of truth)' })
  @ApiResponse({ status: 200, type: Object })
  async upsertOsnRuntimeSettings(@Body() body: any): Promise<TruMarketSettings> {
    return this.service.upsertOsnRuntimeSettings(body);
  }
}

