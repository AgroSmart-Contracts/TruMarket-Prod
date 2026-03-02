import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import mongoose from 'mongoose';

import { config } from './config';
import { providers } from './constants';

export enum ServiceStatus {
  UP = 'UP',
  DOWN = 'DOWN',
}

class ServicesStatus {
  @ApiProperty({ enum: ServiceStatus })
  @Expose()
  database: ServiceStatus;
}

export class AppInfo {
  constructor(appInfo: AppInfo) {
    Object.assign(this, appInfo);
  }

  @ApiProperty({ enum: ServiceStatus })
  @Expose()
  status: ServiceStatus;

  @ApiProperty({
    type: ServicesStatus,
  })
  @Expose()
  services: {
    database: ServiceStatus;
  };
}

@Controller()
export class AppController {
  constructor(
    @Inject(providers.DatabaseConnection)
    private readonly db: mongoose.Connection,
  ) { }

  @Get('/health')
  @ApiOperation({ summary: 'Get application status' })
  @ApiResponse({
    status: 200,
    type: AppInfo,
    description: 'Returns application status',
  })
  health(): AppInfo {
    return new AppInfo({
      status: ServiceStatus.UP,
      services: {
        database:
          this.db.readyState == 1 ? ServiceStatus.UP : ServiceStatus.DOWN,
      },
    });
  }

  @Get('/config')
  @ApiOperation({ summary: 'Get application configuration' })
  @ApiResponse({
    status: 200,
    description: 'Returns application configuration',
  })
  getConfig(): Record<string, any> {
    return {
      evmChainId: config.blockchainChainId,
      blockchainExplorer: config.blockchainExplorer,
      investmentTokenAddress: config.investmentTokenContractAddress,
      investmentTokenSymbol: config.investmentTokenSymbol,
      investmentTokenDecimals: config.investmentTokenDecimals,
      dealsManagerAddress: config.dealsManagerContractAddress,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get application version' })
  @ApiResponse({ status: 200, description: 'Returns application version' })
  getVersion(): string {
    return config.version;
  }
}
