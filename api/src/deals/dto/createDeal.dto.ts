import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { MilestoneDto } from './milestone.dto';

export class CompanyDTO {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  country?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  taxId?: string;
}

export class CreateDealDto {
  @ApiProperty()
  @IsString()
  @Expose()
  name: string;

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

  @ApiProperty()
  @IsNumber()
  @Expose()
  contractId: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  contractAddress?: string;

  @ApiProperty()
  @IsString()
  @Expose()
  origin: string;

  @ApiProperty()
  @IsString()
  @Expose()
  destination: string;

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

  @ApiProperty()
  @IsNumber()
  @Expose()
  offerUnitPrice: number;

  @ApiProperty()
  @IsNumber()
  @Expose()
  quantity: number;

  @ApiProperty({
    required: false,
    description:
      'Optional at create; filled from trade PDFs when omitted (defaults applied server-side).',
  })
  @IsDate()
  @IsOptional()
  @Expose()
  shippingStartDate?: Date;

  @ApiProperty({
    required: false,
    description:
      'Optional at create; filled from trade PDFs when omitted (defaults applied server-side).',
  })
  @IsDate()
  @IsOptional()
  @Expose()
  expectedShippingEndDate?: Date;

  // state properties

  @ApiProperty({
    type: [MilestoneDto],
    required: false,
    description:
      'Optional payment tranches per milestone. Defaults to 7 standard steps (100% on first) when omitted.',
  })
  @IsOptional()
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

  @ApiProperty()
  @IsNumber()
  @Expose()
  revenue: number;

  @ApiProperty()
  @IsNumber()
  @Expose()
  netBalance: number;

  @ApiProperty()
  @IsNumber()
  @Expose()
  roi: number;

  // ownership properties

  @ApiProperty()
  @IsEmail({}, { each: true })
  @ArrayMinSize(1, {
    message: 'buyersEmails must have at least one element',
  })
  @IsArray()
  @Expose()
  buyersEmails: string[];

  @ApiProperty()
  @IsEmail({}, { each: true })
  @ArrayMinSize(1, {
    message: 'suppliersEmails must have at least one element',
  })
  @IsArray()
  @Expose()
  suppliersEmails: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyDTO)
  @Expose()
  buyerCompany?: CompanyDTO;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyDTO)
  @Expose()
  supplierCompany?: CompanyDTO;
}
