import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';

import type { OsnFeeQuoteData } from '@/admin-dashboard/admin-dashboard-fee-quote.service';
import { BankAccountStatus } from '@/bank-accounts/bank-accounts.entities';
import { BankAccountsRepository } from '@/bank-accounts/bank-accounts.repository';
import { providers } from '@/constants';
import { buildDealUpdateFromSuggestions } from '@/deals/apply-deal-field-suggestions';
import {
  buildPaymentDocumentsFromDealCoverage,
  collectDealTradeDocumentsByType,
  dealHasAllRequiredTradeDocuments,
  normalizeTradeDocumentType,
} from '@/deals/deal-trade-document-registry';
import { Deal } from '@/deals/deals.entities';
import { DealsRepository } from '@/deals/deals.repository';
import { mapExtractedFieldsToDealSuggestions } from '@/deals/map-extracted-fields-to-deal-suggestions';
import { BadRequestError, ForbiddenError } from '@/errors';
import { logger } from '@/logger';
import { NotificationsService } from '@/notifications/notifications.service';
import { OsnService } from '@/osn/osn.service';
import type { OsnPaymentHistoryStatusResponse } from '@/osn/osn.types';
import { PdfClassificationService } from '@/pdf-classification/pdf-classification.service';
import { PdfDocumentUploadMode } from '@/pdf-classification/pdf-upload-mode';
import { OsnRuntimeSettingsService } from '@/settings/osn-runtime-settings.service';
import { storageService } from '@/storage/storage.service';
import { RoleType, User } from '@/users/users.entities';
import { UsersRepository } from '@/users/users.repository';

import {
  Payment,
  PaymentProvider,
  PaymentProviderTransferRef,
  PaymentProviderTransferType,
  PaymentStatus,
} from './payments.entities';
import { PaymentsRepository } from './payments.repository';
import { PaymentProviderTransfer } from './provider-transfers.entities';
import { PaymentProviderTransfersRepository } from './provider-transfers.repository';

@Injectable()
export class PaymentsService {
  private static readonly OTHER_DOCUMENT_TYPE = 'Others';
  private static readonly DOCUMENT_TYPE_FILE_NAME_HINTS: Record<
    string,
    string[]
  > = {
    'Commercial Invoice': [
      'invoice',
      'factura',
      'fatura',
      'e001',
      'einvoice',
      'electronicinvoice',
    ],
    'Packing List': [
      'packinglist',
      'packing-list',
      'packlist',
      'packing',
      'pl',
      'empaque',
      'embalaje',
    ],
    'Bill of Lading or AWB': [
      'billoflading',
      'b/l',
      'bl',
      'bld',
      'bldra',
      'awb',
      'airwaybill',
      'waybill',
    ],
    'Phytosanitary Certificate': [
      'phytosanitary',
      'phyto',
      'phito',
      'fito',
      'fitosanitario',
      'fitossanitario',
      'phytocertificate',
    ],
    'Certificate of Origin': [
      'certificateoforigin',
      'certorigin',
      'coo',
      'origen',
      'origem',
      'co',
    ],
  };
  constructor(
    @Inject(providers.PaymentsRepository)
    private readonly payments: PaymentsRepository,
    @Inject(providers.DealsRepository)
    private readonly deals: DealsRepository,
    @Inject(providers.PaymentProviderTransfersRepository)
    private readonly providerTransfers: PaymentProviderTransfersRepository,
    @Inject(providers.BankAccountsRepository)
    private readonly bankAccounts: BankAccountsRepository,
    private readonly osnService: OsnService,
    private readonly osnRuntimeSettings: OsnRuntimeSettingsService,
    private readonly notifications: NotificationsService,
    @Inject(providers.UsersRepository)
    private readonly users: UsersRepository,
    private readonly pdfClassification: PdfClassificationService,
  ) {}

  private displayName(user: User | undefined, fallbackEmail: string): string {
    if (!user) return fallbackEmail.split('@')[0];
    return user.company?.name || user.email?.split('@')[0] || fallbackEmail;
  }

  private feeLine(payment: Payment): string {
    const fq = payment.feeQuote as { totalFee?: number } | undefined;
    if (fq?.totalFee != null) {
      return `${fq.totalFee} ${payment.currency.toUpperCase()}`;
    }
    return `0 ${payment.currency.toUpperCase()}`;
  }

  private async adminEmails(): Promise<string[]> {
    const admins = await this.users.findByRole(RoleType.ADMIN);
    return admins.map((a) => a.email).filter(Boolean) as string[];
  }

  private async handlePaymentInitiatedNotifications(
    paymentId: string,
  ): Promise<void> {
    const claimed = await this.payments.update(
      { _id: paymentId, paymentInitiatedNotifiedAt: { $exists: false } } as any,
      { $set: { paymentInitiatedNotifiedAt: new Date() } } as any,
    );
    if (!claimed) {
      logger.info(
        { eventName: 'payment_initiated', paymentId, transition: false },
        'notification: skipped — already notified',
      );
      return;
    }

    const payment = await this.payments.findById(paymentId);
    if (!payment) return;
    const deal = await this.deals.findById(payment.dealId);
    if (!deal) return;

    const buyer = await this.users.findById(payment.buyerId);
    const supplierUser = payment.supplierId
      ? await this.users.findById(payment.supplierId)
      : undefined;
    const supplierEmail = supplierUser?.email || payment.supplierEmail;
    if (!supplierEmail) {
      logger.warn({ paymentId }, 'payment initiated: supplier email missing');
      return;
    }

    const supplierName = this.displayName(supplierUser, supplierEmail);
    const buyerName = this.displayName(buyer, 'buyer');
    const txId = payment.activeProviderTransferId
      ? (
          await this.providerTransfers.findById(
            payment.activeProviderTransferId,
          )
        )?.providerPaymentId || payment.id
      : payment.id;

    try {
      await this.notifications.sendPaymentInitiatedSupplier(supplierEmail, {
        dealId: deal.id,
        recipientName: supplierName,
        amount: payment.amount,
        currency: payment.currency,
        transactionId: txId,
      });
    } catch (err) {
      logger.warn(
        { err, paymentId },
        'payment initiated: supplier notify failed',
      );
    }

    const admins = await this.adminEmails();
    if (admins.length === 0) {
      logger.warn({ paymentId }, 'payment initiated: no admin users found');
      return;
    }

    const supplierNorm = supplierEmail.trim().toLowerCase();

    for (const adminEmail of admins) {
      if (adminEmail.trim().toLowerCase() === supplierNorm) {
        logger.info(
          { paymentId, adminEmail },
          'payment initiated: skip admin notify — same recipient as supplier',
        );
        continue;
      }
      const adminUser = await this.users.findByEmail(adminEmail);
      try {
        await this.notifications.sendPaymentInitiatedAdmin(adminEmail, {
          dealId: deal.id,
          adminName: this.displayName(adminUser, adminEmail),
          buyerName,
          supplierName,
          amount: payment.amount,
          currency: payment.currency,
          transactionId: txId,
        });
      } catch (err) {
        logger.warn(
          { err, paymentId, adminEmail },
          'payment initiated: admin notify failed',
        );
      }
    }
  }

  private async handleBuyerTransferProofNotifications(
    paymentId: string,
    transfer: PaymentProviderTransfer,
  ): Promise<void> {
    const claimed = await this.payments.update(
      {
        _id: paymentId,
        buyerTransferProofSubmittedAt: { $exists: false },
      } as any,
      { $set: { buyerTransferProofSubmittedAt: new Date() } } as any,
    );
    if (!claimed) {
      logger.info(
        { eventName: 'buyer_transfer_proof', paymentId },
        'notification: skipped — proof already processed',
      );
      return;
    }

    const payment = await this.payments.findById(paymentId);
    if (!payment) return;
    const deal = await this.deals.findById(payment.dealId);
    if (!deal) return;

    const buyer = await this.users.findById(payment.buyerId);
    const supplierUser = payment.supplierId
      ? await this.users.findById(payment.supplierId)
      : undefined;
    const supplierEmail = supplierUser?.email || payment.supplierEmail;
    const supplierName = supplierEmail
      ? this.displayName(supplierUser, supplierEmail)
      : 'the supplier';

    const txId = transfer.providerPaymentId || payment.id;

    const admins = await this.adminEmails();
    if (admins.length > 0 && !payment.buyerProofAdminInAppNotifiedAt) {
      try {
        await this.notifications.sendBuyerTransferProofSubmittedAdminInApp(
          admins,
          {
            dealId: deal.id,
            buyerName: this.displayName(buyer, 'buyer'),
            transactionId: txId,
          },
        );
        await this.payments.updateById(payment.id, {
          buyerProofAdminInAppNotifiedAt: new Date(),
        } as any);
      } catch (err) {
        logger.warn({ err, paymentId }, 'buyer proof: admin in-app failed');
      }
    }

    if (buyer?.email && !payment.buyerProofVerifyingEmailSentAt) {
      try {
        await this.notifications.sendBuyerTransferProofVerifyingEmail(
          buyer.email,
          {
            dealId: deal.id,
            senderName: this.displayName(buyer, buyer.email),
            amount: payment.amount,
            currency: payment.currency,
            fees: this.feeLine(payment),
            recipientName: supplierName,
            transactionId: txId,
          },
        );
        await this.payments.updateById(payment.id, {
          buyerProofVerifyingEmailSentAt: new Date(),
        } as any);
      } catch (err) {
        logger.warn({ err, paymentId }, 'buyer proof: buyer email failed');
      }
    }
  }

  private async getDealForBuyer(dealId: string, user: User): Promise<Deal> {
    const deal = await this.deals.findById(dealId);
    if (!deal) {
      throw new BadRequestError('Deal not found');
    }

    const isBuyer = deal.buyers?.some((b) => b.id === user.id);
    if (!isBuyer) {
      throw new BadRequestError('Only the deal buyer can create payments');
    }

    return deal as Deal;
  }

  private assertFeeQuoteMatchesPayment(
    amount: number,
    currency: string,
    feeQuote: OsnFeeQuoteData | undefined,
  ): void {
    if (!feeQuote) return;
    if (Math.abs(feeQuote.paymentAmount - amount) > 0.009) {
      throw new BadRequestError(
        'feeQuote.paymentAmount must match payment amount',
      );
    }
    const c1 = (currency || '').trim().toUpperCase();
    const c2 = (feeQuote.currency || '').trim().toUpperCase();
    if (c1 !== c2) {
      throw new BadRequestError(
        'feeQuote.currency must match payment currency',
      );
    }
  }

  async createPaymentForDeal(
    dealId: string,
    user: User,
    payload: Partial<Payment>,
  ): Promise<Payment> {
    const deal = await this.getDealForBuyer(dealId, user);

    const sequence = (await this.payments.find({ dealId })).length + 1;

    const supplier =
      deal.suppliers && deal.suppliers.length > 0
        ? deal.suppliers[0]
        : undefined;

    const { feeQuote, ...rest } = payload as Partial<Payment> & {
      feeQuote?: OsnFeeQuoteData;
    };
    this.assertFeeQuoteMatchesPayment(
      payload.amount!,
      payload.currency!,
      feeQuote,
    );

    const existingPayments = await this.payments.find({ dealId });
    const dealCoverage = collectDealTradeDocumentsByType(
      deal,
      existingPayments,
    );
    const inheritedDocs = buildPaymentDocumentsFromDealCoverage(dealCoverage);
    const allRequiredOnDeal = dealHasAllRequiredTradeDocuments(dealCoverage);

    const paymentPayload: Partial<Payment> = {
      ...rest,
      ...(feeQuote ? { feeQuote } : {}),
      dealId,
      buyerId: user.id,
      supplierId: supplier?.id,
      supplierEmail: supplier?.email || payload.supplierEmail,
      sequence,
      ...(inheritedDocs.length > 0 ? { paymentDocuments: inheritedDocs } : {}),
      status:
        payload.status ||
        (allRequiredOnDeal
          ? PaymentStatus.VerifyingDocuments
          : PaymentStatus.InProgress),
    };

    const created = await this.payments.create(paymentPayload);

    // Attach payment id to deal.payments list (simple push)
    await this.deals.updateById(dealId, {
      payments: [...(deal.payments || []), created.id],
    });

    return created;
  }

  async listPaymentsForDeal(dealId: string, user: User): Promise<Payment[]> {
    const deal = await this.deals.findById(dealId);
    if (!deal) {
      throw new BadRequestError('Deal not found');
    }

    const isParticipant = deal.buyers
      .concat(deal.suppliers)
      .some((p) => p.id === user.id);

    if (!isParticipant) {
      throw new BadRequestError(
        'You are not allowed to view payments for this deal',
      );
    }

    return this.payments.find({ dealId }, undefined, {
      sort: { createdAt: 1 },
    } as any);
  }

  async getPaymentById(paymentId: string, user: User): Promise<Payment> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) throw new BadRequestError('Payment not found');
    if (payment.buyerId !== user.id && payment.supplierId !== user.id) {
      throw new ForbiddenError('Not allowed to view this payment');
    }
    return payment;
  }

  async listProviderTransfersForPayment(
    paymentId: string,
    user: User,
  ): Promise<PaymentProviderTransfer[]> {
    const payment = await this.getPaymentById(paymentId, user);
    return this.providerTransfers.find(
      { paymentId: payment.id } as any,
      undefined,
      { sort: { createdAt: -1 } } as any,
    );
  }

  async createOsnMintRequest(
    paymentId: string,
    user: User,
    payload: any,
  ): Promise<PaymentProviderTransfer> {
    void payload;
    const payment = await this.getPaymentById(paymentId, user);
    const runtimeSettings =
      await this.osnRuntimeSettings.getOsnRuntimeSettings();

    if (payment.buyerId !== user.id) {
      throw new ForbiddenError('Only the buyer can start this payment');
    }

    const now = new Date();

    // organization_bank_id must come from the buyer's ACTIVE OSN bank account.
    // Prefer buyer default, then fallback to any ACTIVE buyer OSN account.
    const organizationBankId =
      (
        await this.bankAccounts.findOne({
          userId: user.id,
          provider: 'OSN',
          archived: { $ne: true },
          status: BankAccountStatus.ACTIVE,
          isDefault: true,
        } as any)
      )?.providerAccountId ||
      (
        await this.bankAccounts.findOne({
          userId: user.id,
          provider: 'OSN',
          archived: { $ne: true },
          status: BankAccountStatus.ACTIVE,
        } as any)
      )?.providerAccountId;

    if (!organizationBankId) {
      throw new BadRequestError(
        'No ACTIVE OSN organization bank is configured for this user',
      );
    }

    if (!runtimeSettings.defaultChainId) {
      throw new BadRequestError(
        'OSN_DEFAULT_CHAIN_ID is not configured (admin settings or env fallback)',
      );
    }

    const destination: { walletId?: string; recipientId?: string } = {};
    if (runtimeSettings.defaultWalletId)
      destination.walletId = runtimeSettings.defaultWalletId;
    if (!destination.walletId && runtimeSettings.defaultRecipientId)
      destination.recipientId = runtimeSettings.defaultRecipientId;
    if (!destination.walletId && !destination.recipientId) {
      throw new BadRequestError(
        'OSN_DEFAULT_WALLET_ID or OSN_DEFAULT_RECIPIENT_ID must be configured',
      );
    }

    const memo = payment.invoiceNumber || payment.description || undefined;
    const osnResult = await this.osnService.createMintRequest({
      payment,
      organizationBankId,
      chainId: runtimeSettings.defaultChainId,
      destination,
      memo,
      defaultCurrencyCode: runtimeSettings.defaultCurrencyCode,
    });

    const mintRequestId = osnResult.response.mint_request_id;
    if (!mintRequestId) {
      throw new BadRequestError('OSN mint response is missing mint_request_id');
    }

    const transfer = await this.providerTransfers.create({
      paymentId: payment.id,
      actorUserId: user.id,
      provider: PaymentProvider.OSN,
      type: PaymentProviderTransferType.OSN_MINT,
      request: {
        mint: osnResult.request,
      },
      response: osnResult.response,
      providerMintRequestId: mintRequestId,
      providerPaymentId: osnResult.response.payment_id,
      providerStatus: osnResult.response.status,
      depositInstructions: osnResult.response.deposit_instructions,
      estimatedFees: osnResult.response.estimated_fees,
      payInBankDetails: osnResult.response.pay_in_bank_details,
      createdAt: now,
      updatedAt: now,
    } as Partial<PaymentProviderTransfer>);

    const ref: PaymentProviderTransferRef = {
      provider: PaymentProvider.OSN,
      transferId: transfer.id,
      type: PaymentProviderTransferType.OSN_MINT,
      status: transfer.providerStatus || 'created',
      createdAt: transfer.createdAt,
    };

    await this.payments.updateById(payment.id, {
      providerTransfers: [...(payment.providerTransfers || []), ref],
      activeProviderTransferId: transfer.id,
    } as any);

    await this.payments.updateById(payment.id, {
      method: 'OSN_ONRAMP',
      status: PaymentStatus.InProgress,
    } as any);

    try {
      const approvalResult = await this.osnService.vetSettlementRequest({
        settlementRequestId: mintRequestId,
        approveOrReject: 'approved',
        comments: 'Auto-approved by buyer flow',
      });

      const providerStatus =
        approvalResult.response?.status ||
        osnResult.response.status ||
        'approved';

      const approved = await this.providerTransfers.updateById(transfer.id, {
        request: {
          ...(transfer.request || {}),
          approval: approvalResult.request,
        },
        response: {
          ...(transfer.response || {}),
          approval: approvalResult.response,
        },
        providerStatus,
        updatedAt: new Date(),
      } as any);

      if (!approved) {
        throw new BadRequestError('Failed to persist OSN approval result');
      }

      try {
        await this.handlePaymentInitiatedNotifications(payment.id);
      } catch (err) {
        logger.warn(
          { err, paymentId: payment.id },
          'payment initiated notifications failed',
        );
      }

      return approved;
    } catch (err: unknown) {
      const e = err as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      await this.providerTransfers.updateById(transfer.id, {
        providerStatus: 'approval_failed',
        response: {
          ...(transfer.response || {}),
          approvalError: {
            message:
              e?.response?.data?.message ||
              e?.message ||
              'Failed to auto-approve OSN mint request',
            at: new Date().toISOString(),
          },
        },
        updatedAt: new Date(),
      } as any);

      throw new BadRequestError(
        e?.response?.data?.message ||
          e?.message ||
          'OSN mint request created but auto-approval failed. Please contact support.',
      );
    }
  }

  async submitBankTxNumber(
    transferId: string,
    user: User,
    bankTxNumber: string,
  ): Promise<PaymentProviderTransfer> {
    const transfer = await this.providerTransfers.findById(transferId);
    if (!transfer) throw new BadRequestError('Transfer not found');

    // Actor user or payment buyer can submit.
    const payment = await this.payments.findById(transfer.paymentId);
    if (!payment) throw new BadRequestError('Payment not found');

    if (transfer.actorUserId !== user.id && payment.buyerId !== user.id) {
      throw new ForbiddenError('Not allowed');
    }

    if (!transfer.providerMintRequestId) {
      throw new BadRequestError('Missing providerMintRequestId on transfer');
    }

    const osnSubmitResponse = await this.osnService.submitMintRequest({
      settlementRequestId: transfer.providerMintRequestId,
      bankTxNumber,
    });

    const updated = await this.providerTransfers.updateById(transfer.id, {
      bankTxNumber,
      providerStatus: 'bank_tx_submitted',
      response: {
        ...(transfer.response || {}),
        submit: osnSubmitResponse,
      },
      updatedAt: new Date(),
    } as any);

    if (!updated) throw new BadRequestError('Failed to update transfer');

    try {
      await this.handleBuyerTransferProofNotifications(payment.id, updated);
    } catch (err) {
      logger.warn(
        { err, paymentId: payment.id },
        'buyer transfer proof notifications failed',
      );
    }

    return updated;
  }

  async uploadPaymentDocument(
    paymentId: string,
    dealId: string,
    files: Array<{
      path?: string;
      buffer?: Buffer;
      originalname: string;
      mimetype?: string;
    }>,
    uploadDto:
      | { documentType?: string; documentUploadMode?: string }
      | undefined,
    user: User,
  ): Promise<Payment> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) {
      throw new BadRequestError('Payment not found');
    }

    if (payment.dealId !== dealId) {
      throw new BadRequestError('Payment does not belong to this deal');
    }

    const deal = await this.deals.findById(dealId);
    if (!deal) {
      throw new BadRequestError('Deal not found');
    }

    // Check if user is the supplier for this payment
    const isSupplier = deal.suppliers?.some((s) => s.id === user.id);
    if (!isSupplier) {
      throw new ForbiddenError(
        'Only the supplier can upload payment documents',
      );
    }

    if (!files || files.length === 0) {
      throw new BadRequestError('Please upload at least one file');
    }

    if (
      payment.status !== PaymentStatus.PaymentRequested &&
      payment.status !== PaymentStatus.InProgress &&
      payment.status !== PaymentStatus.VerifyingDocuments
    ) {
      throw new BadRequestError(
        'Documents can only be uploaded when payment is in progress',
      );
    }

    const mode = this.parsePaymentDocumentUploadMode(
      uploadDto?.documentUploadMode,
    );
    if (mode === PdfDocumentUploadMode.Normal) {
      throw new BadRequestError(
        'documentUploadMode "normal" is not valid for payment uploads. Use milestone document upload for general files, or use "payment" or "drawback".',
      );
    }

    let paymentDocuments = [...(payment.paymentDocuments || [])];
    const normalizedRequestedType = this.normalizeDocumentType(
      uploadDto?.documentType,
    );
    const allPayments = await this.payments.find({ dealId });
    const dealCoverage = collectDealTradeDocumentsByType(deal, allPayments);

    for (const file of files) {
      const fileBuffer = file.buffer || fs.readFileSync(file.path!);

      let tradePdfClassification:
        | { detectedType: string; score: number; matchedKeywords: string[] }
        | undefined;
      let peruDrawbackClassification:
        | {
            detectedType: string;
            score: number;
            matchedKeywords: string[];
            processStage?: number;
            documentDateIso?: string;
            boxCount?: number | null;
            validationRulesetId?: string;
            validationRulesVersion?: number;
          }
        | undefined;

      let tradePdfAnalysis: Awaited<
        ReturnType<PdfClassificationService['classifyAndExtractTradePdf']>
      > | null = null;

      if (
        mode === PdfDocumentUploadMode.Payment &&
        this.pdfClassification.shouldClassify(file, mode)
      ) {
        tradePdfAnalysis =
          await this.pdfClassification.classifyAndExtractTradePdf(
            fileBuffer,
            file.originalname,
          );
        if (tradePdfAnalysis?.classification) {
          tradePdfClassification = tradePdfAnalysis.classification;
        }
      }

      if (
        mode === PdfDocumentUploadMode.Drawback &&
        this.pdfClassification.shouldClassify(file, mode)
      ) {
        const c = await this.pdfClassification.classifyPeruDrawbackPdf(
          fileBuffer,
          file.originalname,
        );
        if (c) {
          peruDrawbackClassification = {
            detectedType: c.detectedType,
            score: c.score,
            matchedKeywords: c.matchedKeywords,
            processStage: c.processStage,
            documentDateIso: c.documentDateIso,
            boxCount: c.boxCount ?? null,
            validationRulesetId: c.validationRulesetId,
            validationRulesVersion: c.validationRulesVersion,
          };
        }
      }

      let normalizedType: string;
      if (mode === PdfDocumentUploadMode.Drawback) {
        const det = peruDrawbackClassification?.detectedType;
        normalizedType =
          det && det !== 'Unknown'
            ? det
            : this.detectDocumentTypeFromFileName(file.originalname) ||
              PaymentsService.OTHER_DOCUMENT_TYPE;
      } else {
        const cls = tradePdfClassification?.detectedType;
        const fromClassifier =
          cls && cls !== 'Unknown'
            ? this.normalizeDocumentType(cls) || cls
            : null;
        normalizedType =
          normalizedRequestedType ||
          fromClassifier ||
          this.detectDocumentTypeFromFileName(file.originalname) ||
          PaymentsService.OTHER_DOCUMENT_TYPE;
      }

      const requiredType = normalizeTradeDocumentType(normalizedType);
      const existingOnDeal =
        mode === PdfDocumentUploadMode.Payment && requiredType
          ? dealCoverage.get(requiredType)
          : undefined;

      let newDoc: (typeof paymentDocuments)[number];
      if (existingOnDeal) {
        newDoc = {
          documentType: requiredType!,
          url: existingOnDeal.url,
          uploadedAt: existingOnDeal.uploadedAt
            ? new Date(existingOnDeal.uploadedAt)
            : new Date(),
          verifiedByAdmin: false,
          documentUploadMode: mode,
          reusedFromDeal: true,
          ...(existingOnDeal.tradePdfClassification
            ? { tradePdfClassification: existingOnDeal.tradePdfClassification }
            : tradePdfClassification
              ? { tradePdfClassification }
              : {}),
          ...(peruDrawbackClassification ? { peruDrawbackClassification } : {}),
        };
      } else {
        const timestamp = Date.now();
        const key = `payments/${dealId}/${paymentId}/${timestamp}-${file.originalname}`;
        const uploadedUrl = await storageService.uploadFile(key, fileBuffer);

        newDoc = {
          documentType: normalizedType,
          url: uploadedUrl!,
          uploadedAt: new Date(),
          verifiedByAdmin: false,
          documentUploadMode: mode,
          ...(tradePdfClassification ? { tradePdfClassification } : {}),
          ...(peruDrawbackClassification ? { peruDrawbackClassification } : {}),
        };

        if (requiredType) {
          dealCoverage.set(requiredType, {
            documentType: requiredType,
            url: uploadedUrl!,
            uploadedAt: new Date(),
            source: 'payment',
            sourcePaymentId: paymentId,
            documentUploadMode: mode,
            tradePdfClassification,
          });
        }

        if (tradePdfAnalysis?.extracted) {
          try {
            const freshDeal = await this.deals.findById(dealId);
            if (freshDeal) {
              const suggestions = mapExtractedFieldsToDealSuggestions(
                tradePdfAnalysis.extracted,
              );
              const patch = buildDealUpdateFromSuggestions(
                freshDeal,
                suggestions,
                {
                  preferDocumentValues: true,
                },
              );
              if (Object.keys(patch).length > 0) {
                await this.deals.updateById(dealId, patch);
              }
            }
          } catch (err) {
            logger.warn(
              { err, dealId, fileName: file.originalname },
              'failed to apply extracted trade fields to deal from payment upload',
            );
          }
        }
      }

      const isDrawbackUpload = mode === PdfDocumentUploadMode.Drawback;
      if (
        isDrawbackUpload ||
        normalizedType === PaymentsService.OTHER_DOCUMENT_TYPE
      ) {
        paymentDocuments = [...paymentDocuments, newDoc];
      } else {
        paymentDocuments = [
          ...paymentDocuments.filter((d) => {
            if (d.documentUploadMode === PdfDocumentUploadMode.Drawback) {
              return true;
            }
            return d.documentType.trim() !== normalizedType;
          }),
          newDoc,
        ];
      }

      if (file.path && !process.env.VERCEL) {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    }

    const coverageAfterUpload = collectDealTradeDocumentsByType(
      deal,
      allPayments.map((p) =>
        p.id === paymentId ? { ...p, paymentDocuments } : p,
      ),
    );
    const hasAllRequiredDocs =
      dealHasAllRequiredTradeDocuments(coverageAfterUpload);

    const nextStatus = hasAllRequiredDocs
      ? PaymentStatus.VerifyingDocuments
      : PaymentStatus.InProgress;

    const updatedPayment = await this.payments.updateById(paymentId, {
      paymentDocuments,
      status: nextStatus,
    });

    return updatedPayment;
  }

  private parsePaymentDocumentUploadMode(raw?: string): PdfDocumentUploadMode {
    const v = (raw || '').toLowerCase().trim();
    if (v === PdfDocumentUploadMode.Drawback) {
      return PdfDocumentUploadMode.Drawback;
    }
    if (v === PdfDocumentUploadMode.Normal) {
      return PdfDocumentUploadMode.Normal;
    }
    return PdfDocumentUploadMode.Payment;
  }

  private detectDocumentTypeFromFileName(fileName: string): string | null {
    const lowerFileName = fileName.toLowerCase();
    const normalized = fileName.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const [documentType, hints] of Object.entries(
      PaymentsService.DOCUMENT_TYPE_FILE_NAME_HINTS,
    )) {
      const matched = hints.some((hint) => {
        const compactHint = hint.replace(/[^a-z0-9]/g, '');
        if (!compactHint) {
          return false;
        }

        if (compactHint.length <= 3) {
          const boundaryPattern = new RegExp(
            `(^|[^a-z])${compactHint}([^a-z]|$)`,
          );
          return boundaryPattern.test(lowerFileName);
        }

        return normalized.includes(compactHint);
      });

      if (matched) {
        return documentType;
      }
    }

    return null;
  }

  private normalizeDocumentType(documentType?: string): string | null {
    if (!documentType) {
      return null;
    }

    return normalizeTradeDocumentType(documentType);
  }

  /**
   * Attach trade documents already stored on the deal/shipment to this payment
   * (no re-upload). Used when a payment was created before deal-level docs existed.
   */
  async syncPaymentTradeDocumentsFromDeal(
    paymentId: string,
    dealId: string,
    user: User,
  ): Promise<Payment> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) {
      throw new BadRequestError('Payment not found');
    }
    if (payment.dealId !== dealId) {
      throw new BadRequestError('Payment does not belong to this deal');
    }

    const deal = await this.deals.findById(dealId);
    if (!deal) {
      throw new BadRequestError('Deal not found');
    }

    const isSupplier = deal.suppliers?.some((s) => s.id === user.id);
    if (!isSupplier) {
      throw new ForbiddenError('Only the supplier can sync payment documents');
    }

    const allPayments = await this.payments.find({ dealId });
    const dealCoverage = collectDealTradeDocumentsByType(deal, allPayments);
    const inherited = buildPaymentDocumentsFromDealCoverage(dealCoverage);

    const drawbackAndOther = (payment.paymentDocuments || []).filter((d) => {
      if (d.documentUploadMode === PdfDocumentUploadMode.Drawback) {
        return true;
      }
      const t = normalizeTradeDocumentType(d.documentType);
      return !t;
    });

    const paymentDocuments = [...drawbackAndOther, ...inherited];
    const coverageAfter = collectDealTradeDocumentsByType(
      deal,
      allPayments.map((p) =>
        p.id === paymentId ? { ...p, paymentDocuments } : p,
      ),
    );
    const hasAllRequiredDocs = dealHasAllRequiredTradeDocuments(coverageAfter);
    const nextStatus = hasAllRequiredDocs
      ? PaymentStatus.VerifyingDocuments
      : payment.status;

    return this.payments.updateById(paymentId, {
      paymentDocuments,
      status: nextStatus,
    });
  }

  /**
   * Supplier: flag that they want funds withdrawn / offramped after the payment is completed.
   */
  async requestWithdrawalForPayment(
    dealId: string,
    paymentId: string,
    user: User,
  ): Promise<Payment> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) {
      throw new BadRequestError('Payment not found');
    }
    if (payment.dealId !== dealId) {
      throw new BadRequestError('Payment does not belong to this deal');
    }

    const deal = await this.deals.findById(dealId);
    if (!deal) {
      throw new BadRequestError('Deal not found');
    }

    const isSupplier = deal.suppliers?.some((s) => s.id === user.id);
    if (!isSupplier) {
      throw new ForbiddenError('Only the supplier can request withdrawal');
    }

    if (payment.status !== PaymentStatus.Completed) {
      throw new BadRequestError(
        'Withdrawal can only be requested for completed payments',
      );
    }

    if (payment.isOfframpRequested) {
      return payment;
    }

    const updated = await this.payments.updateById(paymentId, {
      isOfframpRequested: true,
    } as any);
    if (!updated) {
      throw new BadRequestError('Failed to update payment');
    }
    return updated;
  }

  /**
   * Admin: mark supplier documents as verified. Requires OSN deposit completed first.
   */
  async verifyPaymentDocumentsAsAdmin(
    dealId: string,
    paymentId: string,
  ): Promise<Payment> {
    const payment = await this.payments.findById(paymentId);
    if (!payment || payment.dealId !== dealId) {
      throw new BadRequestError('Payment not found');
    }
    if (payment.supplierDocumentsVerifiedNotifiedAt) {
      return payment;
    }
    if (payment.status !== PaymentStatus.VerifyingDocuments) {
      throw new BadRequestError(
        'Payment is not awaiting document verification',
      );
    }
    if (!payment.osnDepositCompletedAt) {
      throw new BadRequestError(
        'Payment must be confirmed by TruMarket before documents can be verified',
      );
    }

    const docs = (payment.paymentDocuments || []).map((d) => ({
      ...d,
      verifiedByAdmin: true,
      verifiedAt: new Date(),
    }));

    const updated = await this.payments.updateById(paymentId, {
      paymentDocuments: docs,
      status: PaymentStatus.Completed,
    } as any);
    if (!updated) throw new BadRequestError('Failed to update payment');

    try {
      const deal = await this.deals.findById(dealId);
      if (!deal) throw new BadRequestError('Deal not found');
      const supplierUser = payment.supplierId
        ? await this.users.findById(payment.supplierId)
        : undefined;
      const supplierEmail = supplierUser?.email || payment.supplierEmail;
      if (!supplierEmail) {
        logger.warn(
          { paymentId },
          'documents verified: supplier email missing',
        );
      } else {
        const txId = payment.activeProviderTransferId
          ? (
              await this.providerTransfers.findById(
                payment.activeProviderTransferId,
              )
            )?.providerPaymentId || payment.id
          : payment.id;
        await this.notifications.sendSupplierDocumentsVerifiedEmailAndInApp(
          supplierEmail,
          {
            dealId,
            recipientName: this.displayName(supplierUser, supplierEmail),
            amount: payment.amount,
            currency: payment.currency,
            transactionId: txId,
          },
        );
      }
      await this.payments.updateById(paymentId, {
        supplierDocumentsVerifiedNotifiedAt: new Date(),
      } as any);
      logger.info(
        { eventName: 'documents_verified', paymentId },
        'documents verified: supplier notified',
      );
    } catch (err) {
      logger.warn(
        { err, paymentId },
        'documents verified: notification failed',
      );
    }

    const out = await this.payments.findById(paymentId);
    return out as Payment;
  }

  /**
   * Poll OSN payment history for all transfers with a `providerPaymentId` and apply idempotent side effects.
   */
  async syncOsnPaymentStatusesFromProvider(): Promise<{
    checked: number;
    errors: number;
    depositCompletedTransitions: number;
    payoutCompletedTransitions: number;
  }> {
    const transfers = (
      await this.providerTransfers.find({
        provider: PaymentProvider.OSN,
      } as any)
    ).filter((t) => !!t.providerPaymentId);

    let errors = 0;
    let depositT = 0;
    let payoutT = 0;

    for (const t of transfers) {
      if (!t.providerPaymentId) continue;
      try {
        const hist = await this.osnService.getPaymentHistoryStatus(
          t.providerPaymentId,
        );
        const status = (hist.status || '').toLowerCase();
        const ptype = (hist.payment_type || '').toLowerCase();

        await this.providerTransfers.updateById(t.id, {
          lastOsnPaymentHistoryStatus: hist.status,
          lastOsnPaymentHistoryType: hist.payment_type,
          lastOsnPaymentHistorySyncedAt: new Date(),
        } as any);

        logger.info(
          {
            eventName: 'osn_payment_history_poll',
            paymentId: t.paymentId,
            providerPaymentId: t.providerPaymentId,
            osnStatus: hist.status,
            osnPaymentType: hist.payment_type,
            previousLocalStatus: t.lastOsnPaymentHistoryStatus,
          },
          'OSN payment status sync: observed',
        );

        if (status !== 'completed') continue;

        const payment = await this.payments.findById(t.paymentId);
        if (!payment) continue;

        if (ptype === 'wallet_to_bank') {
          if (await this.applySupplierPayoutCompleted(payment, t, hist))
            payoutT += 1;
        } else {
          if (await this.applyOsnDepositCompleted(payment, t, hist))
            depositT += 1;
        }
      } catch (err) {
        errors += 1;
        logger.warn(
          { err, transferId: t.id },
          'OSN payment status sync: transfer failed',
        );
      }
    }

    return {
      checked: transfers.length,
      errors,
      depositCompletedTransitions: depositT,
      payoutCompletedTransitions: payoutT,
    };
  }

  private async applyOsnDepositCompleted(
    payment: Payment,
    transfer: PaymentProviderTransfer,
    hist: OsnPaymentHistoryStatusResponse,
  ): Promise<boolean> {
    let p = await this.payments.findById(payment.id);
    if (!p) return false;

    if (
      p.osnDepositBuyerNotifiedAt &&
      p.osnDepositAdminNotifiedAt &&
      p.osnDepositSupplierNotifiedAt
    ) {
      logger.info(
        { paymentId: p.id, eventName: 'osn_deposit_completed' },
        'notification: skipped — deposit side effects already sent',
      );
      return false;
    }

    if (!p.osnDepositCompletedAt) {
      await this.payments.updateById(p.id, {
        osnDepositCompletedAt: new Date(),
      } as any);
      logger.info(
        {
          paymentId: p.id,
          eventName: 'osn_deposit_completed',
          osnStatus: hist.status,
        },
        'payment: OSN deposit marked completed locally',
      );
      p = (await this.payments.findById(p.id)) as Payment;
    }

    const deal = await this.deals.findById(p.dealId);
    if (!deal) return false;

    const buyer = await this.users.findById(p.buyerId);
    const supplierUser = p.supplierId
      ? await this.users.findById(p.supplierId)
      : undefined;
    const supplierEmail = supplierUser?.email || p.supplierEmail;
    const supplierName = supplierEmail
      ? this.displayName(supplierUser, supplierEmail)
      : 'the supplier';
    const txId = transfer.providerPaymentId || p.id;
    const fees = this.feeLine(p);

    let transitioned = false;

    if (!p.osnDepositBuyerNotifiedAt && buyer?.email) {
      transitioned = true;
      try {
        await this.notifications.sendOsnDepositCompletedBuyerEmail(
          buyer.email,
          {
            dealId: deal.id,
            senderName: this.displayName(buyer, buyer.email),
            amount: p.amount,
            currency: p.currency,
            fees,
            recipientName: supplierName,
            transactionId: txId,
          },
        );
        await this.notifications.sendOsnDepositCompletedBuyerInApp(
          buyer.email,
          {
            dealId: deal.id,
            transactionId: txId,
          },
        );
        await this.payments.updateById(p.id, {
          osnDepositBuyerNotifiedAt: new Date(),
        } as any);
      } catch (err) {
        logger.warn(
          { err, paymentId: p.id },
          'OSN deposit: buyer notify failed',
        );
      }
    }

    p = (await this.payments.findById(p.id)) as Payment;
    if (!p.osnDepositAdminNotifiedAt) {
      transitioned = true;
      const admins = await this.adminEmails();
      if (admins.length > 0) {
        try {
          await this.notifications.sendOsnDepositCompletedAdminInApp(admins, {
            dealId: deal.id,
            transactionId: txId,
          });
          await this.payments.updateById(p.id, {
            osnDepositAdminNotifiedAt: new Date(),
          } as any);
        } catch (err) {
          logger.warn(
            { err, paymentId: p.id },
            'OSN deposit: admin notify failed',
          );
        }
      }
    }

    p = (await this.payments.findById(p.id)) as Payment;
    if (!p.osnDepositSupplierNotifiedAt && supplierEmail) {
      transitioned = true;
      try {
        await this.notifications.sendOsnDepositCompletedSupplierEmailAndInApp(
          supplierEmail,
          {
            dealId: deal.id,
            recipientName: supplierName,
            amount: p.amount,
            currency: p.currency,
            transactionId: txId,
          },
        );
        await this.payments.updateById(p.id, {
          osnDepositSupplierNotifiedAt: new Date(),
        } as any);
      } catch (err) {
        logger.warn(
          { err, paymentId: p.id },
          'OSN deposit: supplier notify failed',
        );
      }
    }

    return transitioned;
  }

  private async applySupplierPayoutCompleted(
    payment: Payment,
    transfer: PaymentProviderTransfer,
    hist: OsnPaymentHistoryStatusResponse,
  ): Promise<boolean> {
    if (payment.supplierPayoutSentNotifiedAt) {
      logger.info(
        { paymentId: payment.id, eventName: 'osn_payout_completed' },
        'notification: skipped — payout side effects already sent',
      );
      return false;
    }

    const deal = await this.deals.findById(payment.dealId);
    if (!deal) return false;

    const supplierUser = payment.supplierId
      ? await this.users.findById(payment.supplierId)
      : undefined;
    const supplierEmail = supplierUser?.email || payment.supplierEmail;
    if (!supplierEmail) {
      logger.warn(
        { paymentId: payment.id },
        'OSN payout: supplier email missing',
      );
      return false;
    }

    const txId = transfer.providerPaymentId || payment.id;
    try {
      await this.notifications.sendSupplierPayoutSentEmailAndInApp(
        supplierEmail,
        {
          dealId: deal.id,
          recipientName: this.displayName(supplierUser, supplierEmail),
          amount: payment.amount,
          currency: payment.currency,
          transactionId: txId,
        },
      );
      await this.payments.updateById(payment.id, {
        supplierPayoutSentNotifiedAt: new Date(),
      } as any);
      logger.info(
        {
          paymentId: payment.id,
          eventName: 'osn_payout_completed',
          osnStatus: hist.status,
        },
        'OSN payout: supplier notified',
      );
      return true;
    } catch (err) {
      logger.warn(
        { err, paymentId: payment.id },
        'OSN payout: supplier notify failed',
      );
      return false;
    }
  }

  async markPaymentAsCompleted(paymentId: string): Promise<Payment> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) {
      throw new BadRequestError('Payment not found');
    }

    return this.payments.updateById(paymentId, {
      status: PaymentStatus.Completed,
    } as any);
  }

  async markPaymentAsFailed(paymentId: string): Promise<Payment> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) {
      throw new BadRequestError('Payment not found');
    }

    return this.payments.updateById(paymentId, {
      status: PaymentStatus.Failed,
    });
  }
}
