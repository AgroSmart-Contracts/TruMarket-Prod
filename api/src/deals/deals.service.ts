import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';

import { BlockchainService } from '@/blockchain/blockchain.service';
import { config } from '@/config';
import { providers } from '@/constants';
import SyncDealsLogsJob, {
  DealsLogsJobType,
} from '@/deals-logs/sync-deals-logs-job.model';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@/errors';
import { logger } from '@/logger';
import { NotificationsService } from '@/notifications/notifications.service';
import { PaymentsRepository } from '@/payments/payments.repository';
import { PdfClassificationService } from '@/pdf-classification/pdf-classification.service';
import { PdfDocumentUploadMode } from '@/pdf-classification/pdf-upload-mode';
import { storageService } from '@/storage/storage.service';
import { Page } from '@/types';
import { AccountType, RoleType, User } from '@/users/users.entities';
import { UsersService } from '@/users/users.service';

import {
  type ApplyDealSuggestionsOptions,
  buildDealUpdateFromSuggestions,
  formatSuggestionsForDisplay,
  listAppliedPatchKeys,
} from './apply-deal-field-suggestions';
import {
  DealFieldSuggestions,
  hasDealFieldSuggestions,
  listFilledDealFieldKeys,
  mergeDealFieldSuggestions,
} from './deal-field-suggestions.types';
import {
  buildDealTradeDocumentCoverageDto,
  DealTradeDocumentCoverageDto,
} from './deal-trade-document-registry';
import {
  Deal,
  DealLog,
  DealParticipant,
  DealStatus,
  DocumentFile,
} from './deals.entities';
import { DealsRepository } from './deals.repository';
import { buildDefaultMilestones } from './default-milestones';
import {
  inferDocumentTypeFromFileName,
  resolveTradeDocumentLabel,
} from './infer-document-type-from-filename';
import { mapExtractedFieldsToDealSuggestions } from './map-extracted-fields-to-deal-suggestions';
import { resolveDealCompanies } from './resolve-deal-companies';
import { normalizeTransportMode, TransportMode } from './transport-mode';

export interface ListDealsQuery {
  status?: DealStatus;
  statuses?: DealStatus[];
}

@Injectable()
export class DealsService {
  constructor(
    @Inject(providers.DealsRepository)
    private readonly dealsRepository: DealsRepository,
    @Inject(providers.PaymentsRepository)
    private readonly paymentsRepository: PaymentsRepository,
    private readonly users: UsersService,
    private readonly notifications: NotificationsService,
    private readonly blockchain: BlockchainService,
    private readonly pdfClassification: PdfClassificationService,
  ) {}

  /**
   * Persists detected trade PDF fields onto the deal (fills empty / default fields only).
   */
  async applyDealFieldSuggestions(
    dealId: string,
    suggestions: DealFieldSuggestions,
    options: ApplyDealSuggestionsOptions = {},
  ): Promise<{
    deal: Deal | null;
    appliedFields: string[];
    detectedFields: Record<string, string>;
  }> {
    const detectedFields = formatSuggestionsForDisplay(suggestions);
    const deal = await this.findById(dealId);
    const patch = buildDealUpdateFromSuggestions(deal, suggestions, options);
    const appliedFields = listAppliedPatchKeys(patch);

    logger.info(
      {
        dealId,
        detectedFields,
        appliedFields,
        preferDocumentValues: options.preferDocumentValues,
      },
      'trade PDF suggestions for deal',
    );

    if (appliedFields.length === 0) {
      return { deal: null, appliedFields, detectedFields };
    }

    const updated = await this.dealsRepository.updateById(dealId, patch);
    return { deal: updated, appliedFields, detectedFields };
  }

  private async applyExtractedTradeDocumentToDeal(
    dealId: string,
    extracted: import('@/pdf-trade-classifier').ExtractedDocumentFields,
    options: ApplyDealSuggestionsOptions = {},
  ): Promise<{
    appliedFields: string[];
    detectedFields: Record<string, string>;
  }> {
    const suggestions = mapExtractedFieldsToDealSuggestions(extracted);
    const result = await this.applyDealFieldSuggestions(
      dealId,
      suggestions,
      options,
    );
    return {
      appliedFields: result.appliedFields,
      detectedFields: result.detectedFields,
    };
  }

  private async uploadFile(
    file: { path?: string; buffer?: Buffer; originalname: string },
    dealId: string,
  ): Promise<string | undefined> {
    if (process.env.E2E_TEST) {
      // Only delete file if it's on disk (has a path)
      if (file.path) {
        fs.unlinkSync(file.path);
      }
      return Math.random().toString(36).substring(2, 10);
    }

    // Use buffer if available (memory storage), otherwise read from disk
    const fileBuffer = file.buffer || fs.readFileSync(file.path!);

    const timestamp = Date.now();
    const key = `deals/${dealId}/${timestamp}-${file.originalname}`;

    const uploadedUrl = await storageService.uploadFile(key, fileBuffer);
    return uploadedUrl;
  }

  selectParticipantsEmailsBasedOnUser(
    user: User,
    deal: Partial<Deal>,
  ): string[] {
    return deal.buyers
      .concat(deal.suppliers)
      .map((participant) => {
        if (participant.email !== user.email) {
          return participant.email;
        }
      })
      .filter((v) => v);
  }

  async findDealById(id: string): Promise<Deal> {
    return this.dealsRepository.findById(id);
  }

  async findDealsByUser(
    user: Pick<User, 'id' | 'email'>,
    query: ListDealsQuery,
  ): Promise<Deal[]> {
    return this.dealsRepository.findByUser(user.id, user.email, query);
  }

  /**
   * When automatic acceptance is enabled, mint NFT and attach vault metadata (same path as legacy confirm flow).
   */
  private async applyMintAndVaultIfEnabled(
    deal: Deal,
    dealUpdate: Partial<Deal>,
  ): Promise<void> {
    if (!config.automaticDealsAcceptance || !deal.buyers?.length) {
      return;
    }

    if (typeof deal.nftID === 'number' && deal.nftID > 0) {
      return;
    }

    logger.debug({ dealId: deal.id }, 'Automatic deal acceptance: minting NFT');
    const buyer = await this.users.findByEmail(deal.buyers[0].email);

    const lastBlock = await this.blockchain.getLastBlock();

    const txHash = await this.blockchain.mintNFT(
      deal.investmentAmount,
      buyer.walletAddress,
    );
    const nftID = await this.blockchain.getNftID(txHash);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const vault = await this.blockchain.vault(nftID);

    await SyncDealsLogsJob.create({
      type: DealsLogsJobType.Vault,
      contract: vault,
      lastBlock,
      active: true,
      dealId: nftID,
    });

    dealUpdate.nftID = nftID;
    dealUpdate.mintTxHash = txHash;
    dealUpdate.vaultAddress = vault;
  }

  async createDeal(user: User, dealPayload: Partial<Deal>): Promise<Deal> {
    const buyersEmails =
      dealPayload.buyers?.map((b) => b.email) ??
      (dealPayload as { buyersEmails?: string[] }).buyersEmails ??
      [];
    const suppliersEmails =
      dealPayload.suppliers?.map((s) => s.email) ??
      (dealPayload as { suppliersEmails?: string[] }).suppliersEmails ??
      [];

    const companies = await resolveDealCompanies(this.users, user, {
      buyerCompany: dealPayload.buyerCompany,
      supplierCompany: dealPayload.supplierCompany,
      buyersEmails,
      suppliersEmails,
    });
    dealPayload.buyerCompany = companies.buyerCompany;
    dealPayload.supplierCompany = companies.supplierCompany;

    if (!dealPayload.milestones?.length) {
      dealPayload.milestones = buildDefaultMilestones();
    }

    if (
      dealPayload.investmentAmount == null ||
      Number.isNaN(Number(dealPayload.investmentAmount))
    ) {
      const quantity = Number(dealPayload.quantity) || 0;
      const unitPrice = Number(dealPayload.offerUnitPrice) || 0;
      dealPayload.investmentAmount = quantity * unitPrice;
    }

    if (!dealPayload.transport) {
      dealPayload.transport = TransportMode.BySea;
    } else {
      dealPayload.transport =
        normalizeTransportMode(dealPayload.transport) ?? dealPayload.transport;
    }
    if (
      dealPayload.portOfOrigin == null ||
      dealPayload.portOfOrigin === undefined
    ) {
      dealPayload.portOfOrigin = '';
    }
    if (
      dealPayload.portOfDestination == null ||
      dealPayload.portOfDestination === undefined
    ) {
      dealPayload.portOfDestination = '';
    }

    if (!dealPayload.shippingStartDate) {
      dealPayload.shippingStartDate = new Date();
    }
    if (!dealPayload.expectedShippingEndDate) {
      const end = new Date(dealPayload.shippingStartDate);
      end.setDate(end.getDate() + 30);
      dealPayload.expectedShippingEndDate = end;
    }

    // Active immediately: no proposal / counterparty confirmation handshake.
    dealPayload.status = DealStatus.Confirmed;

    dealPayload.buyers = dealPayload.buyers?.map((buyer) => ({
      ...buyer,
      new: buyer.id !== user.id,
    }));
    dealPayload.suppliers = dealPayload.suppliers?.map((supplier) => ({
      ...supplier,
      new: supplier.id !== user.id,
    }));

    const creatorCompany =
      user.accountType === AccountType.Buyer
        ? dealPayload.buyerCompany
        : dealPayload.supplierCompany;
    if (creatorCompany?.name?.trim()) {
      await this.users.updateById(user.id, {
        company: {
          name: creatorCompany.name,
          country: creatorCompany.country ?? '',
          taxId: creatorCompany.taxId ?? '',
        },
      });
    }

    let deal = await this.dealsRepository.create(dealPayload);

    const mintUpdate: Partial<Deal> = {};
    await this.applyMintAndVaultIfEnabled(deal, mintUpdate);
    if (Object.keys(mintUpdate).length > 0) {
      deal = await this.dealsRepository.updateById(deal.id, mintUpdate);
    }

    if (deal.buyers && deal.suppliers) {
      const participantsNotRegistered = deal.buyers
        .concat(deal.suppliers)
        .filter((participant) => !participant.id);

      if (participantsNotRegistered.length > 0) {
        void this.notifications
          .sendInviteToSignupNotification(
            participantsNotRegistered.map((p) => p.email),
            deal,
            user.email,
          )
          .catch((err) =>
            logger.error(
              { err, dealId: deal.id },
              'invite-to-signup notification failed',
            ),
          );
      }
    }

    void this.notifications
      .sendDealCreatedNotification(
        this.selectParticipantsEmailsBasedOnUser(user, deal),
        deal,
        user.email,
      )
      .catch((err) =>
        logger.error(
          { err, dealId: deal.id },
          'deal-created notification failed',
        ),
      );

    return deal;
  }

  async findById(dealId: string): Promise<Deal> {
    const deal = await this.dealsRepository.findById(dealId);
    if (!deal) {
      throw new BadRequestError('Deal not found');
    }

    return deal;
  }

  async getTradeDocumentCoverage(
    dealId: string,
    user: User,
  ): Promise<DealTradeDocumentCoverageDto> {
    const deal = await this.findUserDealById(dealId, user);
    const payments = await this.paymentsRepository.find({ dealId });
    return buildDealTradeDocumentCoverageDto(deal, payments);
  }

  async findUserDealById(dealId: string, user: User): Promise<Deal> {
    const deal = await this.dealsRepository.findById(dealId);
    if (!deal) {
      throw new BadRequestError('Deal not found');
    }

    await this.checkDealAccess(deal, user);

    const participant = deal.buyers.find((b) => b.id === user.id);
    if (participant) {
      deal.new = participant.new || false;
    } else {
      const participant = deal.suppliers.find((s) => s.id === user.id);
      if (participant) {
        deal.new = participant.new || false;
      }
    }

    deal.milestones = (deal.milestones ?? []).map((m) => {
      return {
        ...m,
        docs: m.docs.map((d) => {
          d.seen = d.seenByUsers ? d.seenByUsers.includes(user.id) : false;
          delete d.seenByUsers;
          return {
            ...d,
          };
        }),
      };
    });

    return deal;
  }

  async confirmDeal(dealId: string, user: User): Promise<Deal> {
    try {
      const deal = await this.findById(dealId);

      if (deal.status !== DealStatus.Proposal) {
        throw new BadRequestError('Deal is not in proposal status');
      }

      await this.checkAuthorizedToUpdateDeal(deal, user);

      const dealUpdate: Partial<Deal> = {};

      dealUpdate.buyers = deal.buyers.map((buyer) => {
        if (buyer.id === user.id) {
          return {
            ...buyer,
            new: false,
          };
        }

        return {
          ...buyer,
        };
      });

      dealUpdate.suppliers = deal.suppliers.map((supplier) => {
        if (supplier.id === user.id) {
          return {
            ...supplier,
            new: false,
          };
        }

        return {
          ...supplier,
        };
      });

      dealUpdate.status = DealStatus.Confirmed;
      await this.applyMintAndVaultIfEnabled(deal, dealUpdate);

      await this.notifications.sendDealConfirmedNotification(
        this.selectParticipantsEmailsBasedOnUser(user, deal),
        deal,
      );

      return this.dealsRepository.updateById(dealId, dealUpdate);
    } catch (error) {
      logger.error(error);
      console.error(error);
      throw new BadRequestError('Failed to confirm deal');
    }
  }

  checkAuthorizedToUpdateDeal(deal: Deal, user: User): void {
    if (
      deal.buyers.concat(deal.suppliers).some((participant) => {
        if (participant.id === user.id) {
          return true;
        }
      })
    ) {
      return;
    }

    throw new UnauthorizedError('You are not allowed to update this deal');
  }

  async cancelDeal(dealId: string, user: User): Promise<Deal> {
    const deal = await this.findById(dealId);

    await this.checkAuthorizedToUpdateDeal(deal, user);

    if (
      deal.status !== DealStatus.Proposal &&
      deal.status !== DealStatus.Confirmed
    ) {
      throw new BadRequestError('Deal cannot be canceled');
    }
    const dealUpdate: Partial<Deal> = {
      status: DealStatus.Cancelled,
    };

    await this.notifications.sendProposalCancelledNotification(
      this.selectParticipantsEmailsBasedOnUser(user, deal),
      deal,
      user.email,
    );

    return this.dealsRepository.updateById(dealId, dealUpdate);
  }

  async setDealAsViewed(dealId: string, user: User): Promise<Deal> {
    const deal = await this.findById(dealId);

    await this.checkAuthorizedToUpdateDeal(deal, user);

    const update: Partial<Deal> = {};

    update.buyers = deal.buyers.map((buyer) => {
      if (buyer.id === user.id) {
        return {
          ...buyer,
          new: false,
        };
      }

      return {
        ...buyer,
      };
    });

    update.suppliers = deal.suppliers.map((supplier) => {
      if (supplier.id === user.id) {
        return {
          ...supplier,
          new: false,
        };
      }

      return {
        ...supplier,
      };
    });

    const dealUpdated = await this.dealsRepository.updateById(dealId, update);

    dealUpdated.new = false;

    return dealUpdated;
  }

  async setDocumentsAsViewed(dealId: string, user: User): Promise<Deal> {
    const deal = await this.findById(dealId);

    await this.checkAuthorizedToUpdateDeal(deal, user);

    const dealUpdated = await this.dealsRepository.updateById(dealId, {
      newDocuments: false,
    });

    return dealUpdated;
  }

  async publishDeal(dealId: string, user: User): Promise<Deal> {
    if (user.accountType !== AccountType.Buyer) {
      throw new UnauthorizedError('You are not allowed to publish this deal');
    }

    try {
      return this.dealsRepository.updateById(dealId, { isPublished: true });
    } catch (error) {
      logger.error(error);
      throw new BadRequestError('Failed to publish deal');
    }
  }

  async setDealAsRepaid(dealId: string, user: User): Promise<Deal> {
    if (user.accountType !== AccountType.Buyer) {
      throw new UnauthorizedError(
        'You are not allowed to set this deal as repaid',
      );
    }

    try {
      const deal = await this.findById(dealId);

      if (deal.status !== DealStatus.Finished) {
        throw new BadRequestError('Deal is not finished');
      }

      await SyncDealsLogsJob.updateOne(
        { contract: deal.vaultAddress },
        { $set: { active: false } },
      );

      this.blockchain.setDealAsCompleted(deal.nftID as number);

      return this.dealsRepository.updateById(dealId, {
        status: DealStatus.Repaid,
      });
    } catch (error) {
      logger.error(error);
      throw new BadRequestError('Failed to publish deal');
    }
  }

  async updateDeal(
    dealId: string,
    dealPayload: Partial<Deal>,
    user: User,
  ): Promise<Deal> {
    if (Object.keys(dealPayload).length === 0) {
      throw new BadRequestError('No data to update');
    }

    const deal = await this.findById(dealId);

    this.checkAuthorizedToUpdateDeal(deal, user);

    if (
      deal.status !== DealStatus.Proposal &&
      deal.status !== DealStatus.Confirmed
    ) {
      throw new BadRequestError('Deal cannot be updated');
    }

    await this.notifications.sendChangesInProposalNotification(
      this.selectParticipantsEmailsBasedOnUser(user, deal),
      deal,
      user.email,
    );

    dealPayload.buyers = deal.buyers.map((buyer) => ({
      ...buyer,
    }));

    dealPayload.suppliers = deal.suppliers.map((supplier) => ({
      ...supplier,
    }));

    dealPayload.status = DealStatus.Confirmed;

    return this.dealsRepository.updateById(dealId, dealPayload);
  }

  async deleteDeal(dealId: string): Promise<void> {
    const deal = await this.findById(dealId);
    if (!deal) {
      throw new BadRequestError('Deal not found');
    }
    await this.dealsRepository.delete(dealId);
  }

  async uploadDealDocument(
    dealId: string,
    file: { path: string; originalname: string },
    description: string,
    user: User,
  ): Promise<DocumentFile> {
    const deal = await this.findById(dealId);

    this.checkDealSupplier(
      deal,
      user,
      'You are not allowed to upload documents for this deal',
    );

    const uploadedUrl = await this.uploadFile(file, dealId);

    return this.dealsRepository.pushDocument(dealId, {
      url: uploadedUrl,
      description,
      seenByUsers: [user.id],
    });
  }

  async uploadDealCoverImage(
    dealId: string,
    file: { path: string; originalname: string },
    user: User,
  ): Promise<Deal> {
    const deal = await this.findById(dealId);

    this.checkDealAccess(
      deal,
      user,
      'You are not allowed to upload the cover image for this deal',
    );

    const uploadedUrl = await this.uploadFile(file, dealId);

    return this.dealsRepository.updateById(dealId, {
      coverImageUrl: uploadedUrl,
    });
  }

  async removeDocumentFromDeal(
    dealId: string,
    documentId: string,
    user: User,
  ): Promise<void> {
    const deal = await this.findById(dealId);

    this.checkDealSupplier(
      deal,
      user,
      'You are not allowed to delete documents',
    );

    await this.dealsRepository.pullDocument(dealId, documentId);
  }

  async uploadDocumentToMilestone(
    dealId: string,
    milestoneId: string,
    file: Express.Multer.File,
    description: string,
    user: User,
    documentUploadMode?: string,
    skipMilestoneRestriction = false,
  ): Promise<DocumentFile> {
    const deal = await this.findById(dealId);

    const rawMode = (documentUploadMode || PdfDocumentUploadMode.Normal)
      .toLowerCase()
      .trim();
    const mode =
      rawMode === PdfDocumentUploadMode.Payment
        ? PdfDocumentUploadMode.Payment
        : rawMode === PdfDocumentUploadMode.Drawback
          ? PdfDocumentUploadMode.Drawback
          : PdfDocumentUploadMode.Normal;

    if (mode === PdfDocumentUploadMode.Drawback) {
      this.checkDealSupplier(
        deal,
        user,
        'Only the supplier can upload drawback documents',
      );
    } else if (skipMilestoneRestriction) {
      this.checkDealParticipant(
        deal,
        user,
        'You are not allowed to upload documents for this deal',
      );
    } else {
      this.checkDealSupplier(
        deal,
        user,
        'You are not allowed to upload documents for this deal',
      );
    }

    if (
      !skipMilestoneRestriction &&
      deal.milestones[deal.currentMilestone].id !== milestoneId
    ) {
      throw new ForbiddenError(
        'You are not allowed to upload documents for this milestone',
      );
    }

    const milestone = deal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new BadRequestError('Milestone not found');
    }

    const uploadedUrl = await this.uploadFile(file, dealId);

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
          validationRulesetId?: string;
          validationRulesVersion?: number;
        }
      | undefined;

    let storedDescription = description;

    if (
      mode === PdfDocumentUploadMode.Payment &&
      this.pdfClassification.shouldClassify(file, mode)
    ) {
      const analysis = await this.pdfClassification.classifyAndExtractTradePdf(
        fileBuffer,
        file.originalname,
      );
      if (analysis?.classification) {
        tradePdfClassification = analysis.classification;
      }
      if (
        !tradePdfClassification ||
        tradePdfClassification.detectedType === 'Unknown'
      ) {
        const inferred = inferDocumentTypeFromFileName(file.originalname);
        if (inferred) {
          tradePdfClassification = {
            detectedType: inferred,
            score: 1,
            matchedKeywords: [`filename:${inferred}`],
          };
        }
      }
      storedDescription = resolveTradeDocumentLabel(
        file.originalname,
        tradePdfClassification,
        description,
      );

      if (analysis?.extracted) {
        try {
          await this.applyExtractedTradeDocumentToDeal(
            dealId,
            analysis.extracted,
            {
              preferDocumentValues: true,
            },
          );
        } catch (err) {
          logger.warn(
            { err, dealId, fileName: file.originalname },
            'failed to apply extracted trade fields to deal',
          );
        }
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
          validationRulesetId: c.validationRulesetId,
          validationRulesVersion: c.validationRulesVersion,
        };
      }
    }

    const document = await this.dealsRepository.pushMilestoneDocument(
      dealId,
      milestoneId,
      {
        url: uploadedUrl,
        description: storedDescription,
        seenByUsers: [user.id],
        documentUploadMode: mode,
        verifiedByAdmin: false,
        ...(tradePdfClassification ? { tradePdfClassification } : {}),
        ...(peruDrawbackClassification ? { peruDrawbackClassification } : {}),
      },
    );

    await this.notifications.sendNewMilestoneDocumentUploadedNotification(
      this.selectParticipantsEmailsBasedOnUser(user, deal),
      deal,
      milestone,
      user.email,
    );

    return document;
  }

  /**
   * Admin: mark a milestone drawback document as verified (Drawback tab / SUNAT package).
   */
  async verifyDrawbackMilestoneDocumentAsAdmin(
    dealId: string,
    milestoneId: string,
    docId: string,
  ): Promise<DocumentFile> {
    const deal = await this.findById(dealId);
    const milestone = deal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new BadRequestError('Milestone not found');
    }
    const doc = milestone.docs.find((d) => d.id === docId);
    if (!doc) {
      throw new BadRequestError('Document not found');
    }
    if (doc.documentUploadMode !== PdfDocumentUploadMode.Drawback) {
      throw new BadRequestError('Only drawback documents can be verified');
    }

    await this.dealsRepository.updateMilestoneDocument(
      dealId,
      milestoneId,
      docId,
      'verifiedByAdmin',
      true,
    );

    const updated = await this.dealsRepository.updateMilestoneDocument(
      dealId,
      milestoneId,
      docId,
      'verifiedAt',
      new Date().toISOString(),
    );

    return updated;
  }

  async updateMilestoneDocument(
    dealId: string,
    milestoneId: string,
    docId: string,
    key: string,
    value: string | boolean,
    user: User,
  ): Promise<DocumentFile> {
    const deal = await this.findById(dealId);

    this.checkDealSupplier(
      deal,
      user,
      'You are not allowed to update documents in this deal',
    );

    if (deal.milestones[deal.currentMilestone].id !== milestoneId) {
      throw new ForbiddenError(
        'You are not allowed to update documents in this milestone',
      );
    }

    const milestone = deal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new BadRequestError('Milestone not found');
    }

    const document = await this.dealsRepository.updateMilestoneDocument(
      dealId,
      milestoneId,
      docId,
      key,
      value,
    );

    this.notifications.sendNewMilestoneDocumentUploadedNotification(
      this.selectParticipantsEmailsBasedOnUser(user, deal),
      deal,
      milestone,
      user.email,
    );

    return document;
  }

  async setMilestoneDocumentAsViewed(
    dealId: string,
    milestoneId: string,
    docId: string,
    user: User,
  ): Promise<DocumentFile> {
    const deal = await this.findById(dealId);

    const milestone = deal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new BadRequestError('Milestone not found');
    }

    const doc = milestone.docs.find((d) => d.id === docId);
    if (!doc) {
      throw new BadRequestError('Document not found');
    }

    if (doc.seenByUsers && doc.seenByUsers.includes(user.id)) {
      throw new BadRequestError('Document already seen');
    }

    const document = await this.dealsRepository.setMilestoneDocumentAsViewed(
      dealId,
      milestoneId,
      docId,
      user.id,
    );

    return document;
  }

  async removeDocumentFromMilestone(
    dealId: string,
    milestoneId: string,
    documentId: string,
    user: User,
  ): Promise<void> {
    const deal = await this.findById(dealId);

    this.checkDealSupplier(
      deal,
      user,
      'You are not allowed to remove documents from this deal',
    );

    const milestone = deal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new BadRequestError('Milestone not found');
    }
    await this.dealsRepository.pullMilestoneDocument(
      dealId,
      milestoneId,
      documentId,
    );
  }

  async assignNftIdToDeal(
    dealId: string,
    nftID: number,
    mintTxHash: string,
    vaultAddress: string,
  ): Promise<Deal> {
    await this.findById(dealId);
    return this.dealsRepository.updateById(dealId, {
      nftID,
      mintTxHash,
      vaultAddress,
    });
  }

  checkDealAccess(deal: Deal, user: User, errorMessage?: string): void {
    if (
      deal.buyers.concat(deal.suppliers).some((participant) => {
        if (participant.id === user.id) {
          return true;
        }
      })
    ) {
      return;
    }

    throw new UnauthorizedError(
      errorMessage || 'You are not allowed to access this deal information',
    );
  }

  /**
   * Ensures the user may read an object from Blob storage. Paths are expected to be
   * `deals/{dealId}/...` or `payments/{dealId}/...` (see storage uploads). Admins may read any trusted blob URL.
   */
  async assertUserMayReadBlobUrl(user: User, blobUrl: string): Promise<void> {
    if (!storageService.isTrustedVercelBlobUrl(blobUrl)) {
      throw new BadRequestError('Invalid blob URL');
    }

    if (user?.role === RoleType.ADMIN) {
      return;
    }

    let pathname: string;
    try {
      pathname = new URL(blobUrl).pathname;
    } catch {
      throw new BadRequestError('Invalid blob URL');
    }

    const normalized = pathname.replace(/^\/+/, '');
    const match =
      normalized.match(/^deals\/([^/]+)\//) ||
      normalized.match(/^payments\/([^/]+)\//);

    if (!match) {
      throw new ForbiddenError('You do not have access to this file');
    }

    const dealId = match[1];
    const deal = await this.findById(dealId);
    this.checkDealAccess(deal, user, 'You do not have access to this file');
  }

  checkDealBuyer(deal: Deal, user: User, errorMessage?: string): void {
    if (
      deal.buyers.some((participant) => {
        if (participant.id === user.id) {
          return true;
        }
      })
    ) {
      return;
    }

    throw new UnauthorizedError(
      errorMessage || 'Only a deal buyer can do this operation on this deal',
    );
  }

  async analyzeDealDocuments(files: Express.Multer.File[]): Promise<{
    documents: Array<{
      fileName: string;
      detectedType: string;
      tradePdfClassification?: {
        detectedType: string;
        score: number;
        matchedKeywords: string[];
      };
      suggestedDescription: string;
    }>;
    suggestions: DealFieldSuggestions;
    filledFields: string[];
    detectedFields: Record<string, string>;
  }> {
    if (!files?.length) {
      throw new BadRequestError('At least one file is required');
    }

    const parts: DealFieldSuggestions[] = [];
    const documents: Array<{
      fileName: string;
      detectedType: string;
      tradePdfClassification?: {
        detectedType: string;
        score: number;
        matchedKeywords: string[];
      };
      suggestedDescription: string;
    }> = [];

    const sortedFiles = [...files].sort((a, b) =>
      (a.originalname || '').localeCompare(b.originalname || '', undefined, {
        sensitivity: 'base',
      }),
    );

    for (const file of sortedFiles) {
      const buffer = file.buffer || fs.readFileSync(file.path!);

      let detectedType = 'Unknown';
      let tradePdfClassification:
        | { detectedType: string; score: number; matchedKeywords: string[] }
        | undefined;

      if (this.pdfClassification.isPdf(file)) {
        const analysis =
          await this.pdfClassification.classifyAndExtractTradePdf(
            buffer,
            file.originalname,
          );

        if (analysis?.extracted) {
          const fileSuggestions = mapExtractedFieldsToDealSuggestions(
            analysis.extracted,
          );
          if (hasDealFieldSuggestions(fileSuggestions)) {
            parts.push(fileSuggestions);
          }
          if (analysis.classification.detectedType !== 'Unknown') {
            tradePdfClassification = analysis.classification;
            detectedType = analysis.classification.detectedType;
          } else if (hasDealFieldSuggestions(fileSuggestions)) {
            detectedType =
              fileSuggestions.variety ??
              fileSuggestions.name ??
              'Trade document';
          }
        }

        if (detectedType === 'Unknown') {
          const drawback = await this.pdfClassification.classifyPeruDrawbackPdf(
            buffer,
            file.originalname,
          );
          if (drawback && drawback.detectedType !== 'Unknown') {
            detectedType = drawback.detectedType;
          }
        }
      }

      documents.push({
        fileName: file.originalname,
        detectedType,
        ...(tradePdfClassification ? { tradePdfClassification } : {}),
        suggestedDescription:
          detectedType !== 'Unknown' ? detectedType : file.originalname,
      });
    }

    const suggestions = mergeDealFieldSuggestions(parts);
    const filledFields = listFilledDealFieldKeys(suggestions);
    const detectedFields = formatSuggestionsForDisplay(suggestions);

    logger.info(
      { detectedFields, filledFields, fileCount: files.length },
      'analyze-deal-documents: detected field values',
    );

    return { documents, suggestions, filledFields, detectedFields };
  }

  async uploadDealCreationDocuments(
    dealId: string,
    files: Express.Multer.File[],
    user: User,
  ): Promise<{
    documents: DocumentFile[];
    suggestions: DealFieldSuggestions;
    detectedFields: Record<string, string>;
    appliedFields: string[];
  }> {
    const deal = await this.findById(dealId);
    this.checkDealParticipant(
      deal,
      user,
      'You are not allowed to upload documents for this deal',
    );

    const milestone = deal.milestones[0];
    if (!milestone?.id) {
      throw new BadRequestError('Deal has no milestones');
    }

    const uploaded: DocumentFile[] = [];
    const suggestionParts: DealFieldSuggestions[] = [];

    for (const file of files) {
      const doc = await this.uploadDocumentToMilestone(
        dealId,
        milestone.id,
        file,
        file.originalname,
        user,
        PdfDocumentUploadMode.Payment,
        true,
      );
      uploaded.push(doc);
    }

    for (const file of files) {
      const buffer = file.buffer || fs.readFileSync(file.path!);
      if (!this.pdfClassification.isPdf(file)) continue;
      const analysis = await this.pdfClassification.classifyAndExtractTradePdf(
        buffer,
        file.originalname,
      );
      if (analysis?.extracted) {
        suggestionParts.push(
          mapExtractedFieldsToDealSuggestions(analysis.extracted),
        );
      }
    }

    const suggestions = mergeDealFieldSuggestions(suggestionParts);
    const detectedFields = formatSuggestionsForDisplay(suggestions);
    const { appliedFields } = await this.applyDealFieldSuggestions(
      dealId,
      suggestions,
      {
        preferDocumentValues: true,
      },
    );

    return { documents: uploaded, suggestions, detectedFields, appliedFields };
  }

  checkDealParticipant(deal: Deal, user: User, errorMessage?: string): void {
    const isParticipant =
      deal.suppliers.some((p) => p.id === user.id) ||
      deal.buyers.some((p) => p.id === user.id);
    if (isParticipant) {
      return;
    }
    throw new UnauthorizedError(
      errorMessage || 'Only deal participants can perform this operation',
    );
  }

  checkDealSupplier(deal: Deal, user: User, errorMessage?: string): void {
    if (
      deal.suppliers.some((participant) => {
        if (participant.id === user.id) {
          return true;
        }
      })
    ) {
      return;
    }

    throw new UnauthorizedError(
      errorMessage || 'Only a deal supplier can do this operation on this deal',
    );
  }

  async findDealsLogs(dealId: string): Promise<DealLog[]> {
    const deal = await this.findById(dealId);
    return this.dealsRepository.findDealsLogs(deal.nftID);
  }

  async assignUserToDeals(user: User): Promise<void> {
    return this.dealsRepository.assignUserToDeals(
      user.id,
      user.email,
      user.walletAddress,
    );
  }

  async updateCurrentMilestone(
    dealId: string,
    currentMilestone: number,
    signature: string,
    user: User,
  ): Promise<Deal> {
    const deal = await this.findById(dealId);

    this.checkDealBuyer(
      deal,
      user,
      'User not authorized to update the current milestone for this deal',
    );

    if (deal.nftID === undefined) {
      throw new BadRequestError('Deal NFT must be minted first');
    }

    if (
      currentMilestone < 0 ||
      currentMilestone >= deal.milestones.length ||
      deal.currentMilestone + 1 !== currentMilestone
    ) {
      throw new BadRequestError(
        `Cannot update milestone. The next milestone to update is Milestone ${deal.currentMilestone + 1}`,
      );
    }

    const validSignature = await this.blockchain.verifyMessage(
      user.walletAddress as `0x${string}`,
      `Approve milestone ${currentMilestone} of deal ${deal.nftID}`,
      signature as `0x${string}`,
    );

    if (!validSignature) {
      throw new ForbiddenError('Invalid signature');
    }

    await this.notifications.sendMilestoneApprovedNotification(
      this.selectParticipantsEmailsBasedOnUser(user, deal),
      deal,
      deal.milestones[currentMilestone],
      user.email,
    );

    return this.dealsRepository.updateById(dealId, {
      currentMilestone: deal.currentMilestone + 1,
    });
  }

  async getDealsParticipantsByEmails(
    usersEmails: string[],
  ): Promise<DealParticipant[]> {
    const users = await this.users.findByEmails(usersEmails);

    return usersEmails.map((email) => {
      const user = users.find((u) => u.email === email);

      if (user) {
        return {
          id: user.id,
          email: user.email,
          walletAddress: user.walletAddress,
        };
      }

      return { email };
    });
  }

  async paginate(
    offset: number,
    status: DealStatus,
    emailsSearch: string,
    search: string,
  ): Promise<Page<Deal>> {
    const query = {} as any;

    if (status) {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: new RegExp(search, 'i') };
    }

    if (emailsSearch) {
      query.$or = [
        { 'buyers.email': { $regex: new RegExp(emailsSearch, 'i') } },
        { 'suppliers.email': { $regex: new RegExp(emailsSearch, 'i') } },
      ];
    }

    return this.dealsRepository.paginate(query, offset);
  }
}
