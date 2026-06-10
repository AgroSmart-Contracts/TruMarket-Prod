import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { config } from '@/config';

import { CCTP_DESTINATION_CHAIN, CCTP_SOURCE_CHAINS } from './cctp.constants';

export class CctpConfigResponseDto {
  destinationChain: string;
  sourceChains: { id: string; label: string }[];
  arc: {
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
    usdcAddress: string;
  };
  dealsManagerAddress: string;
  automaticDealMint: boolean;
}

@ApiTags('cctp')
@Controller('cctp')
export class CctpController {
  @Get('config')
  @ApiOperation({
    summary: 'CCTP / Bridge Kit configuration for cross-chain USDC deposits',
  })
  @ApiOkResponse({ description: 'Bridge routes and Arc deployment targets' })
  getConfig(): CctpConfigResponseDto {
    return {
      destinationChain: CCTP_DESTINATION_CHAIN,
      sourceChains: CCTP_SOURCE_CHAINS.map(({ id, label }) => ({ id, label })),
      arc: {
        chainId: config.arcChainId,
        rpcUrl: config.arcRpcUrl,
        explorerUrl: config.arcExplorerUrl,
        usdcAddress: config.arcUsdcAddress,
      },
      dealsManagerAddress: config.dealsManagerContractAddress,
      automaticDealMint: config.automaticDealsAcceptance,
    };
  }
}
