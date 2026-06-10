import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
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
import { BadRequestError } from '@/errors';
import { User } from '@/users/users.entities';

// import { WhitelistAccessRestricted } from '../decorators/whitelistRestricted';
import fileInterceptor from '../file.interceptor';
import { filePipeValidator, multerOptions } from '../multer.options';
import { Deal, DocumentFile } from './deals.entities';
import { DealsService } from './deals.service';
import { AnalyzeDealDocumentsResponseDto } from './dto/analyzeDealDocumentsResponse.dto';
// import { AssignNFTDto } from './dto/assignNFTID.dto';
import { CreateDealDto } from './dto/createDeal.dto';
import { DealLogsDtoResponse } from './dto/dealLogsResponse.dto';
import { DealDtoResponse } from './dto/dealResponse.dto';
import { documentResponseDTO } from './dto/documentResponse.dto';
import { ListDealsDto } from './dto/listDeals.dto';
import { ListDealDtoResponse } from './dto/listDealsResponse.dto';
import { UpdateDealDto } from './dto/updateDeal.dto';
import { UpdateDocumentDto } from './dto/updateDocument.dto';
import { UploadDocumentDTO } from './dto/uploadDocument.dto';

@ApiTags('deals')
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Get all deals' })
  @ApiResponse({
    status: 200,
    type: [ListDealDtoResponse],
    description: 'Returns all deals',
  })
  async findAll(
    @Request() req,
    @Query() query: ListDealsDto,
  ): Promise<ListDealDtoResponse[]> {
    const user: User = req.user;

    const deals = await this.dealsService.findDealsByUser(user, query);

    return deals.map((deal) => new ListDealDtoResponse(deal));
  }

  @Post()
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Create a deal' })
  @ApiResponse({
    status: 201,
    type: DealDtoResponse,
    description: 'The deal has been successfully created',
  })
  async create(
    @Body() dealDto: CreateDealDto,
    @Request() req,
  ): Promise<DealDtoResponse> {
    const user: User = req.user;

    const dealPayload: Partial<Deal> = {
      ...dealDto,
      buyerCompany: dealDto.buyerCompany as Deal['buyerCompany'],
      supplierCompany: dealDto.supplierCompany as Deal['supplierCompany'],
    };

    const [buyers, suppliers] = await Promise.all([
      this.dealsService.getDealsParticipantsByEmails(dealDto.buyersEmails),
      this.dealsService.getDealsParticipantsByEmails(dealDto.suppliersEmails),
    ]);
    dealPayload.buyers = buyers;
    dealPayload.suppliers = suppliers;

    const deal = await this.dealsService.createDeal(user, dealPayload);

    return new DealDtoResponse(deal);
  }

  @Post('analyze-documents')
  @AuthenticatedRestricted()
  @ApiOperation({
    summary:
      'Analyze trade PDFs before deal creation (classification + field suggestions)',
  })
  @ApiResponse({ status: 200, type: AnalyzeDealDocumentsResponseDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  async analyzeDealDocuments(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<AnalyzeDealDocumentsResponseDto> {
    if (!files?.length) {
      throw new BadRequestError('At least one PDF file is required');
    }
    return this.dealsService.analyzeDealDocuments(files);
  }

  @Get(':dealId/trade-document-coverage')
  @AuthenticatedRestricted()
  @ApiOperation({
    summary:
      'Required trade documents on file for this shipment (deal-level, shared across payments)',
  })
  async getTradeDocumentCoverage(
    @Param('dealId') dealId: string,
    @Request() req,
  ) {
    const user: User = req.user;
    return this.dealsService.getTradeDocumentCoverage(dealId, user);
  }

  @Get(':dealId')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Get a deal' })
  @ApiResponse({
    status: 200,
    type: DealDtoResponse,
    description: 'Returns deal with id',
  })
  async findOne(
    @Param('dealId') id: string,
    @Request() req,
  ): Promise<DealDtoResponse> {
    const user: User = req.user;
    const deal = await this.dealsService.findUserDealById(id, user);

    const dealDto = new DealDtoResponse(deal);

    return dealDto;
  }

  @Put(':dealId')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Update a deal' })
  @ApiResponse({
    status: 200,
    type: DealDtoResponse,
    description: 'The deal has been successfully updated',
  })
  async update(
    @Param('dealId') id: string,
    @Body() dealDto: UpdateDealDto,
    @Request() req,
  ): Promise<DealDtoResponse> {
    const user: User = req.user;

    const {
      confirm,
      cancel,
      view,
      viewDocuments,
      isPublished,
      repaid,
      ...restDealDto
    } = dealDto;

    let deal: Deal;

    if (confirm) {
      deal = await this.dealsService.confirmDeal(id, user);
    } else if (cancel) {
      deal = await this.dealsService.cancelDeal(id, user);
    } else if (view) {
      deal = await this.dealsService.setDealAsViewed(id, user);
    } else if (viewDocuments) {
      deal = await this.dealsService.setDocumentsAsViewed(id, user);
    } else if (isPublished) {
      deal = await this.dealsService.publishDeal(id, user);
    } else if (repaid) {
      deal = await this.dealsService.setDealAsRepaid(id, user);
    } else {
      deal = await this.dealsService.updateDeal(
        id,
        {
          ...restDealDto,
          buyerCompany: restDealDto.buyerCompany as Deal['buyerCompany'],
          supplierCompany:
            restDealDto.supplierCompany as Deal['supplierCompany'],
        },
        user,
      );
    }

    return new DealDtoResponse(deal);
  }

  @Put(':dealId/cover-image')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Upload deal cover image' })
  @ApiResponse({
    status: 200,
    type: DealDtoResponse,
    description: 'The deal cover image was successfully uploaded',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(fileInterceptor)
  async uploadDealCoverImage(
    @Param('dealId') id: string,
    @UploadedFile(filePipeValidator) file: Express.Multer.File,
    @Request() req,
  ): Promise<DealDtoResponse> {
    const user: User = req.user;

    console.log('uploading deal cover image');
    const deal = await this.dealsService.uploadDealCoverImage(id, file, user);

    return new DealDtoResponse(deal);
  }

  // @Post(':dealId/docs')
  // @AuthenticatedRestricted()
  // @ApiOperation({ summary: 'Upload document to a deal milestone' })
  // @ApiResponse({
  //   status: 200,
  //   type: documentResponseDTO,
  //   description: 'The deal document was successfully uploaded',
  // })
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(fileInterceptor)
  // async uploadDealDocument(
  //   @Param('dealId') id: string,
  //   @Body() payload: UploadDocumentDTO,
  //   @UploadedFile(filePipeValidator) file: Express.Multer.File,
  //   @Request() req,
  // ): Promise<documentResponseDTO> {
  //   const user: User = req.user;

  //   const doc = await this.dealsService.uploadDealDocument(
  //     id,
  //     file,
  //     payload.description,
  //     user,
  //   );

  //   return new documentResponseDTO(doc);
  // }

  // @Delete(':dealId/docs/:docId')
  // @AdminAccessRestricted()
  // @ApiOperation({ summary: 'Delete deal document' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The deal document was successfully deleted',
  // })
  // async deleteDealDocument(
  //   @Param('dealId') id: string,
  //   @Param('docId') docId: string,
  //   @Request() req,
  // ): Promise<void> {
  //   const user: User = req.user;
  //   await this.dealsService.removeDocumentFromDeal(id, docId, user);
  // }

  // @Post(':dealId/whitelist')
  // @AdminAccessRestricted()
  // @ApiOperation({ summary: 'Whitelist wallet' })
  // @ApiResponse({
  //   status: 200,
  //   type: WalletResponseDTO,
  //   description: 'The wallet was successfully whitelisted',
  // })
  // async whitelistAddress(
  //   @Param('dealId') id: string,
  //   @Body() payload: WhitelistWalletDto,
  // ): Promise<WalletResponseDTO> {
  //   const deal = await DealModel.findOneAndUpdate(
  //     { _id: id, 'whitelist.address': { $ne: payload.address.toLowerCase() } },
  //     {
  //       $push: { whitelist: payload },
  //     },
  //     { new: true },
  //   );

  //   if (!deal) {
  //     throw new ConflictError();
  //   }

  //   const whitelist = deal.whitelist;

  //   if (!whitelist.length) {
  //     throw new InternalServerError('failed pusing wallet');
  //   }

  //   const wallet = whitelist.pop();
  //   return new WalletResponseDTO(wallet.toJSON());
  // }

  // @Delete(':dealId/whitelist/:walletId')
  // @AdminAccessRestricted()
  // @ApiOperation({ summary: 'Remove wallet from whitelist' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The wallet was successfully deleted from whitelist',
  // })
  // async blacklistAddress(
  //   @Param('dealId') id: string,
  //   @Param('walletId') walletId: string,
  // ): Promise<void> {
  //   await DealModel.findByIdAndUpdate(id, {
  //     $pull: { whitelist: { _id: walletId } },
  //   });
  // }

  @Get('/:dealId/logs')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Get nft logs' })
  @ApiResponse({
    status: 200,
    type: [DealLogsDtoResponse],
    description: 'The nft logs were successfully got',
  })
  async getDealLogs(
    @Param('dealId') id: string,
    @Request() req,
  ): Promise<DealLogsDtoResponse[]> {
    const user: User = req.user;
    await this.dealsService.findUserDealById(id, user);
    const logs = await this.dealsService.findDealsLogs(id);
    return logs.map((doc) => new DealLogsDtoResponse(doc));
  }

  @Post(':dealId/creation-documents')
  @AuthenticatedRestricted()
  @ApiOperation({
    summary:
      'Upload deal/shipment PDFs right after creation (first milestone, any participant)',
  })
  @ApiResponse({
    status: 200,
    type: [documentResponseDTO],
    description: 'Documents uploaded to the deal',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  async uploadDealCreationDocuments(
    @Param('dealId') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ): Promise<{
    documents: documentResponseDTO[];
    detectedFields: Record<string, string>;
    appliedFields: string[];
    suggestions: Record<string, unknown>;
  }> {
    const user: User = req.user;
    if (!files?.length) {
      throw new BadRequestError('At least one file is required');
    }
    const result = await this.dealsService.uploadDealCreationDocuments(
      id,
      files,
      user,
    );
    return {
      documents: result.documents.map((doc) => new documentResponseDTO(doc)),
      detectedFields: result.detectedFields,
      appliedFields: result.appliedFields,
      suggestions: result.suggestions,
    };
  }

  @Post(':dealId/milestones/:milestoneId/docs')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Upload document to a deal milestone' })
  @ApiResponse({
    status: 200,
    type: documentResponseDTO,
    description: 'The deal milestone document was successfully uploaded',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(fileInterceptor)
  async uploadMilestoneDocument(
    @Param('dealId') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() payload: UploadDocumentDTO,
    @UploadedFile(filePipeValidator) file: Express.Multer.File,
    @Request() req,
  ): Promise<documentResponseDTO> {
    const user: User = req.user;

    const doc = await this.dealsService.uploadDocumentToMilestone(
      id,
      milestoneId,
      file,
      payload.description,
      user,
      payload.documentUploadMode,
    );

    return new documentResponseDTO(doc);
  }

  @Post(':dealId/milestones/:milestoneId/docs/:docId/verify-drawback')
  @AdminAccessRestricted()
  @ApiOperation({ summary: 'Admin: verify a milestone drawback document' })
  @ApiResponse({
    status: 200,
    type: documentResponseDTO,
    description: 'Drawback document marked as verified',
  })
  async verifyDrawbackMilestoneDocument(
    @Param('dealId') id: string,
    @Param('milestoneId') milestoneId: string,
    @Param('docId') docId: string,
  ): Promise<documentResponseDTO> {
    const doc = await this.dealsService.verifyDrawbackMilestoneDocumentAsAdmin(
      id,
      milestoneId,
      docId,
    );
    return new documentResponseDTO(doc);
  }

  @Put(':dealId/milestones/:milestoneId/docs/:docId')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Update document' })
  @ApiResponse({
    status: 200,
    type: documentResponseDTO,
    description: 'The deal milestone was successfully updated',
  })
  async updateMilestoneDocument(
    @Param('dealId') id: string,
    @Param('milestoneId') milestoneId: string,
    @Param('docId') docId: string,
    @Body() payload: UpdateDocumentDto,
    @Request() req,
  ): Promise<documentResponseDTO> {
    const user: User = req.user;

    let doc: DocumentFile;

    if (payload.description) {
      doc = await this.dealsService.updateMilestoneDocument(
        id,
        milestoneId,
        docId,
        'description',
        payload.description,
        user,
      );
    } else if ('publiclyVisible' in payload) {
      doc = await this.dealsService.updateMilestoneDocument(
        id,
        milestoneId,
        docId,
        'publiclyVisible',
        payload.publiclyVisible,
        user,
      );
    } else if (payload.view) {
      doc = await this.dealsService.setMilestoneDocumentAsViewed(
        id,
        milestoneId,
        docId,
        user,
      );
    } else {
      throw new BadRequestError('empty payload');
    }

    return new documentResponseDTO(doc);
  }

  @Delete(':dealId/milestones/:milestoneId/docs/:docId')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Delete a milestone document' })
  @ApiResponse({
    status: 200,
    description: 'The deal milestone document was successfully deleted',
  })
  async deleteMilestoneDocument(
    @Param('dealId') id: string,
    @Param('milestoneId') milestoneId: string,
    @Param('docId') docId: string,
    @Request() req,
  ): Promise<void> {
    const user: User = req.user;
    await this.dealsService.removeDocumentFromMilestone(
      id,
      milestoneId,
      docId,
      user,
    );
  }

  // DEPRECATED: tx to assign nft to deal is now done in the blockchain service
  // @Post(':dealId/nft')
  // @AdminAccessRestricted()
  // @ApiOperation({ summary: 'Assign NFT to deal' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The NFT was successfully assigned',
  // })
  // async assignNFT(
  //   @Param('dealId') id: string,
  //   @Body() dto: AssignNFTDto,
  // ): Promise<void> {
  //   const nftID = await this..getNftID(dto.txHash);

  //   await this.dealsService.assignNftIdToDeal(id, nftID, dto.txHash);
  // }
}
