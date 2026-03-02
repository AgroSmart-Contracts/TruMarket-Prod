import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BlockchainService } from '@/blockchain/blockchain.service';
import { DealsService } from '@/deals/deals.service';
import { DealLogsDtoResponse } from '@/deals/dto/dealLogsResponse.dto';
import { ListDealDtoResponse } from '@/deals/dto/listDealsResponse.dto';
import SyncDealsLogsJob, {
  DealsLogsJobType,
} from '@/deals-logs/sync-deals-logs-job.model';
import { AdminAccessRestricted } from '@/decorators/adminRestricted';
import { InternalServerError } from '@/errors';
import { Page } from '@/types';
import { UsersService } from '@/users/users.service';

import { DealDtoResponse } from './../deals/dto/dealResponse.dto';
import { DealsParamsDto } from './dto/dealsParams.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly dealsService: DealsService,
    private readonly blockchainService: BlockchainService,
    private readonly usersService: UsersService,
  ) {}

  @Get('deals')
  @AdminAccessRestricted()
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Returns list of all deals',
    type: [ListDealDtoResponse],
  })
  async findDeals(
    @Query() params: DealsParamsDto,
  ): Promise<Page<ListDealDtoResponse>> {
    const deals = await this.dealsService.paginate(
      params.offset,
      params.status,
      params.emailSearch,
      params.search,
    );

    return deals;
  }

  @Get('deals/:dealId')
  @AdminAccessRestricted()
  @ApiOperation({ summary: 'Find a deal' })
  @ApiResponse({
    status: 200,
    type: DealDtoResponse,
    description: 'The deal has been successfully deleted',
  })
  async findDealById(@Param('dealId') id: string): Promise<DealDtoResponse> {
    return new DealDtoResponse(await this.dealsService.findById(id));
  }

  @Delete('deals/:dealId')
  @AdminAccessRestricted()
  @ApiOperation({ summary: 'Delete a deal' })
  @ApiResponse({
    status: 200,
    description: 'The deal has been successfully deleted',
  })
  async delete(@Param('dealId') id: string): Promise<void> {
    await this.dealsService.deleteDeal(id);
  }

  @Get('/:dealId/logs')
  @AdminAccessRestricted()
  @ApiOperation({ summary: 'Get nft logs' })
  @ApiResponse({
    status: 200,
    type: [DealLogsDtoResponse],
    description: 'The nft logs were successfully got',
  })
  async getDealLogs(
    @Param('dealId') id: string,
  ): Promise<DealLogsDtoResponse[]> {
    const logs = await this.dealsService.findDealsLogs(id);
    return logs.map((doc) => new DealLogsDtoResponse(doc));
  }

  @Post('deals/:dealId/nft/mint')
  @AdminAccessRestricted()
  @ApiOperation({ summary: 'Mint a NFT representing the deal' })
  @ApiResponse({
    status: 200,
    description: 'The deal nft has been successfully minted',
  })
  async mintDealNFT(@Param('dealId') id: string): Promise<void> {
    const deal = await this.dealsService.findById(id);

    if (typeof deal.nftID === 'number') {
      throw new InternalServerError('Deal already has a NFT');
    }

    const buyer = await this.usersService.findByEmail(deal.buyers[0].email);

    const lastBlock = await this.blockchainService.getLastBlock();

    const txHash = await this.blockchainService.mintNFT(
      deal.milestones.map((m) => m.fundsDistribution),
      deal.investmentAmount,
      buyer.walletAddress,
    );

    const nftID = await this.blockchainService.getNftID(txHash);
    const vaultAddress = await this.blockchainService.vault(nftID);

    await SyncDealsLogsJob.create({
      type: DealsLogsJobType.Vault,
      contract: vaultAddress,
      lastBlock,
      active: true,
      dealId: nftID,
    });

    await this.dealsService.assignNftIdToDeal(id, nftID, txHash, vaultAddress);
  }
}
