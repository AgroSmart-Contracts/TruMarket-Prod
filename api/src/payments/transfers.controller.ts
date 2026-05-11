import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticatedRestricted } from '@/decorators/authenticatedRestricted';
import { User } from '@/users/users.entities';

import { PaymentsService } from './payments.service';
import { PaymentProviderTransfer } from './provider-transfers.entities';

@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':id/bank-tx-number')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Submit buyer bank transfer transaction number for a provider transfer' })
  @ApiResponse({ status: 200, type: 'object' })
  async submitBankTxNumber(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { bankTxNumber: string },
  ): Promise<PaymentProviderTransfer> {
    const user: User = req.user;
    return this.paymentsService.submitBankTxNumber(id, user, body.bankTxNumber);
  }
}

