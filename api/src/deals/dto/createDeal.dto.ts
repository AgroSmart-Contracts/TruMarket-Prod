import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { MilestoneDto } from './milestone.dto';

export class CompanyDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty()
  @IsString()
  @Expose()
  country: string;

  @ApiProperty()
  @IsString()
  @Expose()
  taxId: string;
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

  @ApiProperty()
  @IsString()
  @Expose()
  portOfOrigin: string;

  @ApiProperty()
  @IsString()
  @Expose()
  portOfDestination: string;

  @ApiProperty()
  @IsString()
  @Expose()
  transport: string;

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

  @ApiProperty()
  @IsDate()
  @Expose()
  shippingStartDate: Date;

  @ApiProperty()
  @IsDate()
  @Expose()
  expectedShippingEndDate: Date;

  // state properties

  @ApiProperty({
    type: [MilestoneDto],
    description: 'Array of 7 milestone objects',
    example: [{ description: '...', location: '...', date: 'YYYY-MM-DD' }],
    maxLength: 7,
    minLength: 7,
  })
  @ArrayMinSize(7, {
    message: 'Milestones array must have at least 7 elements',
  })
  @ArrayMaxSize(7, { message: 'Milestones array must have at most 7 elements' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  @Expose()
  milestones: MilestoneDto[];

  // financial properties

  @ApiProperty()
  @IsNumber()
  @Expose()
  investmentAmount: number;

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

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => CompanyDTO)
  @Expose()
  buyerCompany: CompanyDTO;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => CompanyDTO)
  @Expose()
  supplierCompany: CompanyDTO;
}
