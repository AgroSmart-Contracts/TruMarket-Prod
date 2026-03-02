import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BadRequestError, NotFoundError } from '@/errors';
import { AuthGuard } from '@/guards/auth.guard';
import { logger } from '@/logger';
import { User } from '@/users/users.entities';

import { KYCVerification } from './dto/kycVerificationResponse.dto';
import { SDKResponseDto } from './dto/sdkTokenResponse.dto';
import { KYCService } from './kyc.service';

@ApiTags('Kyc')
@Controller('/kyc')
export class KYCController {
  constructor(private readonly kycService: KYCService) {}

  @Post('/verifications')
  @UseGuards(AuthGuard)
  @ApiOperation({ description: 'Used to create a KYC verification.' })
  @ApiOkResponse({
    description: 'KYC verification created',
    type: KYCVerification,
  })
  async create(@Request() req): Promise<any> {
    const user: User = req.user;

    try {
      const kycVerification = await this.kycService.createApplicant(user);
      return kycVerification;
    } catch (err) {
      if (err.message === 'KYC applicant already exists') {
        throw new BadRequestError('KYC applicant already exists');
      }

      logger.error('Error Creating KYC Application', err);
      throw new InternalServerErrorException('Error Creating KYC Application');
    }
  }

  @Post('/sdkToken')
  @ApiOperation({ description: 'Used to create a Onfido SDK Token.' })
  @ApiOkResponse({
    description: 'SDK token created',
    type: SDKResponseDto,
  })
  @UseGuards(AuthGuard)
  async sdkToken(@Request() req) {
    const user: User = req.user;

    const userId = user.id;

    const kycVerification =
      await this.kycService.getKYCVerificationByUserId(userId);

    if (!kycVerification) {
      throw new NotFoundError('KYC verification not found');
    }

    try {
      const sdkToken =
        await this.kycService.createOnfidoSDKToken(kycVerification);
      return new SDKResponseDto({
        sdkToken,
        workflowRunId: kycVerification.workflowRunId,
      });
    } catch (err) {
      logger.error('Error Creating SDK Token', err);
      throw new InternalServerErrorException('KYC provider exception');
    }
  }

  @Post('/webhook')
  @ApiOperation({
    description: 'Used by Onfido to send verifications changes events.',
  })
  async webhook(@Body() payload: any, @Request() req) {
    // TODO: handle errors
    this.kycService.verifyWebhookEvent(
      JSON.stringify(payload),
      req.get('X-SHA2-Signature'),
    );

    return { success: true };
  }
}
