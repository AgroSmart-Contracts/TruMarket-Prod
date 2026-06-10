import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticatedRestricted } from '@/decorators/authenticatedRestricted';

import { OsnService } from './osn.service';
import {
  OsnOrganizationBank,
  OsnOrganizationWallet,
  OsnRecipient,
} from './osn.types';

@ApiTags('osn')
@Controller('osn')
export class OsnController {
  constructor(private readonly osnService: OsnService) {}

  @Get('organization-banks')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'List OSN organization banks' })
  @ApiResponse({ status: 200, type: [Object] })
  async listOrganizationBanks(
    @Query('active') active?: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<OsnOrganizationBank[]> {
    const activeBool = active === undefined ? undefined : active === 'true';
    return this.osnService.listOrganizationBanks({
      active: activeBool,
      organizationId,
    });
  }

  @Get('recipients')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'List OSN recipients' })
  @ApiResponse({ status: 200, type: [Object] })
  async listRecipients(): Promise<OsnRecipient[] | { data: OsnRecipient[] }> {
    return this.osnService.listRecipients() as any;
  }

  @Get('wallets/organization')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'List OSN organization wallets' })
  @ApiResponse({ status: 200, type: [Object] })
  async listOrganizationWallets(): Promise<
    OsnOrganizationWallet[] | { wallets: OsnOrganizationWallet[] }
  > {
    return this.osnService.listOrganizationWallets() as any;
  }
}
