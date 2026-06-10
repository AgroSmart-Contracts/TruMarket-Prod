import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AdminAccessRestricted } from '@/decorators/adminRestricted';
import { AuthenticatedRestricted } from '@/decorators/authenticatedRestricted';
import { multerOptions } from '@/multer.options';
import { User } from '@/users/users.entities';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/paymentResponse.dto';
import { UploadPaymentDocumentDto } from './dto/upload-payment-document.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('deals/:dealId/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Create payment for a deal' })
  @ApiResponse({
    status: 201,
    type: PaymentResponseDto,
    description: 'Payment created for the deal',
  })
  async createPayment(
    @Param('dealId') dealId: string,
    @Body() dto: CreatePaymentDto,
    @Request() req,
  ): Promise<PaymentResponseDto> {
    const user: User = req.user;

    const payment = await this.paymentsService.createPaymentForDeal(
      dealId,
      user,
      dto,
    );

    return new PaymentResponseDto(payment as any);
  }

  @Get()
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'List payments for a deal' })
  @ApiResponse({
    status: 200,
    type: [PaymentResponseDto],
    description: 'All payments associated with this deal',
  })
  async listPayments(
    @Param('dealId') dealId: string,
    @Request() req,
  ): Promise<PaymentResponseDto[]> {
    const user: User = req.user;
    const payments = await this.paymentsService.listPaymentsForDeal(
      dealId,
      user,
    );

    return payments.map((p) => new PaymentResponseDto(p as any));
  }

  @Post(':paymentId/trade-documents/sync')
  @AuthenticatedRestricted()
  @ApiOperation({
    summary:
      'Link trade documents already on the shipment to this payment (no re-upload)',
  })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async syncPaymentTradeDocuments(
    @Param('dealId') dealId: string,
    @Param('paymentId') paymentId: string,
    @Request() req,
  ): Promise<PaymentResponseDto> {
    const user: User = req.user;
    const payment =
      await this.paymentsService.syncPaymentTradeDocumentsFromDeal(
        paymentId,
        dealId,
        user,
      );
    return new PaymentResponseDto(payment as any);
  }

  @Post(':paymentId/documents')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Upload document for a payment' })
  @ApiResponse({
    status: 200,
    type: PaymentResponseDto,
    description: 'Payment document uploaded successfully',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  async uploadPaymentDocument(
    @Param('dealId') dealId: string,
    @Param('paymentId') paymentId: string,
    @Body() dto: UploadPaymentDocumentDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ): Promise<PaymentResponseDto> {
    const user: User = req.user;

    const payment = await this.paymentsService.uploadPaymentDocument(
      paymentId,
      dealId,
      files,
      dto,
      user,
    );

    return new PaymentResponseDto(payment as any);
  }

  @Post(':paymentId/verify-documents')
  @AdminAccessRestricted()
  @ApiOperation({
    summary:
      'Admin: verify supplier payment documents (requires OSN deposit completed)',
  })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async verifyPaymentDocuments(
    @Param('dealId') dealId: string,
    @Param('paymentId') paymentId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentsService.verifyPaymentDocumentsAsAdmin(
      dealId,
      paymentId,
    );
    return new PaymentResponseDto(payment as any);
  }

  @Post(':paymentId/request-withdrawal')
  @AuthenticatedRestricted()
  @ApiOperation({
    summary: 'Supplier: request withdrawal / offramp for a completed payment',
  })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async requestWithdrawal(
    @Param('dealId') dealId: string,
    @Param('paymentId') paymentId: string,
    @Request() req,
  ): Promise<PaymentResponseDto> {
    const user: User = req.user;
    const payment = await this.paymentsService.requestWithdrawalForPayment(
      dealId,
      paymentId,
      user,
    );
    return new PaymentResponseDto(payment as any);
  }
}
