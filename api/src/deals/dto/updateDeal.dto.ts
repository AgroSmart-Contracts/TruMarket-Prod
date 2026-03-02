import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CompanyDTO } from './createDeal.dto';
import { MilestoneDto } from './milestone.dto';

export class UpdateDealDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  carbonFootprint?: string;

  // shipping properties

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Expose()
  contractId?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  contractAddress?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  origin?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  destination?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  portOfOrigin?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  portOfDestination?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  transport?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  presentation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  size?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  variety?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  quality?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Expose()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Expose()
  offerUnitPrice?: number;

  // totalValue is calculated as offerUnitPrice * quantity

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Expose()
  shippingStartDate?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Expose()
  expectedShippingEndDate?: Date;

  // duration and daysLeft are calculated based on shippingStartDate and expectedShippingEndDate

  // state properties

  @ApiProperty({
    type: [MilestoneDto],
    description: 'Array of 7 milestone objects',
    example: [{ description: '...', location: '...', date: 'YYYY-MM-DD' }],
    maxLength: 7,
    minLength: 7,
    required: false,
  })
  @IsOptional()
  @ArrayMinSize(7, {
    message: 'Milestones array must have at least 7 elements',
  })
  @ArrayMaxSize(7, { message: 'Milestones array must have at most 7 elements' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  @Expose()
  milestones?: MilestoneDto[];

  // financial properties

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Expose()
  investmentAmount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Expose()
  revenue?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Expose()
  netBalance?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Expose()
  roi?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => CompanyDTO)
  @Expose()
  buyerCompany?: CompanyDTO;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => CompanyDTO)
  @Expose()
  supplierCompany?: CompanyDTO;

  // actions

  @ApiProperty({
    required: false,
    description:
      'Confirm the deal on buyer or supplier party. Having both parties confirming the deal settle the deal. If buyer or supplier updates the deal the other party needs to confirm the deal again.',
  })
  @IsBoolean()
  @IsOptional()
  @Expose()
  confirm?: boolean;

  @ApiProperty({ required: false, description: 'Rejects deal conditions.' })
  @IsBoolean()
  @IsOptional()
  @Expose()
  cancel?: boolean;

  @ApiProperty({
    required: false,
    description: 'Change deal status as viewed',
  })
  @IsBoolean()
  @IsOptional()
  @Expose()
  view?: boolean;

  @ApiProperty({
    required: false,
    description: 'Change deal documents as viewed',
  })
  @IsBoolean()
  @IsOptional()
  @Expose()
  viewDocuments?: boolean;

  @ApiProperty({
    required: false,
    description: 'Change deal documents as viewed',
  })
  @IsBoolean()
  @IsOptional()
  @Expose()
  isPublished?: boolean;

  @ApiProperty({
    required: false,
    description:
      'Set deal as repaid. This action will unlock deal funds to be reclaimed.',
  })
  @IsBoolean()
  @IsOptional()
  @Expose()
  repaid?: boolean;
}
