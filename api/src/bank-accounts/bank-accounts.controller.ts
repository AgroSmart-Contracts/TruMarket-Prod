import { Body, Controller, Get, Param, Post, Put, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticatedRestricted } from '@/decorators/authenticatedRestricted';
import { User } from '@/users/users.entities';

import { BankAccountsService } from './bank-accounts.service';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get()
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'List bank accounts for current user (archived=false)' })
  @ApiResponse({ status: 200, type: [BankAccountResponseDto] })
  async list(@Request() req): Promise<BankAccountResponseDto[]> {
    const user: User = req.user;
    const accounts = await this.bankAccountsService.listForUser(user);
    return accounts.map((a) => new BankAccountResponseDto(a as any));
  }

  @Get(':id')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Get bank account details by id' })
  @ApiResponse({ status: 200, type: BankAccountResponseDto })
  async get(@Request() req, @Param('id') id: string): Promise<BankAccountResponseDto> {
    const user: User = req.user;
    const account = await this.bankAccountsService.getForUser(user, id);
    return new BankAccountResponseDto(account as any);
  }

  @Post()
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Create a new bank account request (creates PENDING_APPROVAL record)' })
  @ApiResponse({ status: 201, type: BankAccountResponseDto })
  async create(@Request() req, @Body() dto: CreateBankAccountDto): Promise<BankAccountResponseDto> {
    const user: User = req.user;
    const created = await this.bankAccountsService.createForUser(user, dto);
    return new BankAccountResponseDto(created as any);
  }

  @Post(':id/set-default')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Set bank account as default (only ACTIVE)' })
  @ApiResponse({ status: 200, type: BankAccountResponseDto })
  async setDefault(@Request() req, @Param('id') id: string): Promise<BankAccountResponseDto> {
    const user: User = req.user;
    const updated = await this.bankAccountsService.setDefault(user, id);
    return new BankAccountResponseDto(updated as any);
  }

  @Put(':id')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Update bank account details in-place (supplier only)' })
  @ApiResponse({ status: 200, type: BankAccountResponseDto })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    const user: User = req.user;
    const updated = await this.bankAccountsService.updateForUser(id, user, dto);
    return new BankAccountResponseDto(updated as any);
  }

  @Post('sync/osn-organization-banks')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Sync OSN organization bank activation state into local DB (admin/system use)' })
  async syncOsnOrganizationBanks(): Promise<{ updated: number; checked: number; errors: number; transitions: number }> {
    return this.bankAccountsService.syncOsnOrganizationBanks();
  }
}

