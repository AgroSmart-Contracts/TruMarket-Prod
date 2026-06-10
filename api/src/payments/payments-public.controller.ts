import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  AdminDashboardFeeQuoteService,
  OsnFeeQuoteData,
} from '@/admin-dashboard/admin-dashboard-fee-quote.service';
import { AuthenticatedRestricted } from '@/decorators/authenticatedRestricted';
import { User } from '@/users/users.entities';

import { OsnFeeQuoteRequestDto } from './dto/osn-fee-quote-request.dto';
import { PaymentResponseDto } from './dto/paymentResponse.dto';
import { PaymentsService } from './payments.service';
import { PaymentProviderTransfer } from './provider-transfers.entities';

@ApiTags('payments')
@Controller('payments')
export class PaymentsPublicController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly adminDashboardFeeQuoteService: AdminDashboardFeeQuoteService,
  ) {}

  /**
   * Proxies admin-dashboard internal pre-mint quote. Browser calls here only — secrets stay on the API.
   * Contract: `AdminDashboardFeeQuoteService.getFeeQuote`.
   */
  @Post('osn/fee-quote')
  @AuthenticatedRestricted()
  @ApiOperation({
    summary: 'Pre-mint OSN fee quote (proxied from admin-dashboard)',
  })
  @ApiResponse({
    status: 200,
    description: 'Normalized `data` from admin fee-quote',
  })
  async getOsnFeeQuote(
    @Body() dto: OsnFeeQuoteRequestDto,
  ): Promise<OsnFeeQuoteData> {
    return this.adminDashboardFeeQuoteService.getFeeQuote(
      dto.amount,
      dto.currency.trim().toUpperCase(),
      {
        partner: dto.partner?.trim(),
        promoCode: dto.promoCode?.trim(),
      },
    );
  }

  @Get(':id')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Get payment details by id' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async getPayment(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PaymentResponseDto> {
    const user: User = req.user;
    const payment = await this.paymentsService.getPaymentById(id, user);
    return new PaymentResponseDto(payment as any);
  }

  @Get(':id/transfers')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'List provider transfers for a payment' })
  @ApiResponse({ status: 200, type: 'array' })
  async listTransfers(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PaymentProviderTransfer[]> {
    const user: User = req.user;
    return this.paymentsService.listProviderTransfersForPayment(id, user);
  }

  @Post(':id/osn/mint-request')
  @AuthenticatedRestricted()
  @ApiOperation({
    summary:
      'Create and auto-approve OSN mint request, then persist provider transfer',
  })
  @ApiResponse({ status: 201, type: 'object' })
  async createMintRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user: User = req.user;
    return this.paymentsService.createOsnMintRequest(id, user, body);
  }
}
