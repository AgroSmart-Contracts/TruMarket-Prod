import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

import { DocumentFile } from './../deals.entities';

export class MilestoneDTO {
  @ApiProperty()
  @Expose()
  id?: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  fundsDistribution: number;
}

export class ParticipantDTO {
  @ApiProperty()
  @Expose()
  id?: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  approved?: boolean;
}

export class CompanyDTO {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  country: string;

  @ApiProperty()
  @Expose()
  taxId: string;
}

export class DealDtoResponse {
  constructor(res: DealDtoResponse) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  contractId: number;

  @ApiProperty()
  @Expose()
  contractAddress: string;

  @ApiProperty()
  @Expose()
  nftID: number;

  @ApiProperty()
  @Expose()
  vaultAddress: string;

  @ApiProperty()
  @Expose()
  origin: string;

  @ApiProperty()
  @Expose()
  destination: string;

  @ApiProperty()
  @Expose()
  portOfOrigin: string;

  @ApiProperty()
  @Expose()
  portOfDestination: string;

  @ApiProperty()
  @Expose()
  transport: string;

  @ApiProperty()
  @Expose()
  presentation: string;

  @ApiProperty()
  @Expose()
  variety: string;

  @ApiProperty()
  @Expose()
  size: string;

  @ApiProperty()
  @Expose()
  coverImageUrl: string;

  @ApiProperty()
  @Expose()
  docs: DocumentFile[];

  @ApiProperty()
  @Expose()
  shippingStartDate: Date;

  @ApiProperty()
  @Expose()
  expectedShippingEndDate: Date;

  @ApiProperty()
  @IsNumber()
  @Expose()
  currentMilestone: number;

  @ApiProperty({
    type: [MilestoneDTO],
  })
  @Expose()
  milestones: MilestoneDTO[];

  @ApiProperty()
  @Expose()
  investmentAmount: number;

  @ApiProperty()
  @Expose()
  revenue: number;

  @ApiProperty()
  @Expose()
  netBalance: number;

  @ApiProperty()
  @Expose()
  roi: number;

  @ApiProperty()
  @Expose()
  carbonFootprint: string;

  @ApiProperty()
  @Expose()
  duration: string;

  @ApiProperty()
  @Expose()
  daysLeft: number;

  @ApiProperty()
  @Expose()
  quality: string;

  @ApiProperty()
  @Expose()
  offerUnitPrice: number;

  @ApiProperty()
  @Expose()
  quantity: number;

  @ApiProperty()
  @Expose()
  totalValue: number;

  @ApiProperty({
    type: [ParticipantDTO],
  })
  @Expose()
  buyers: ParticipantDTO[];

  @ApiProperty({
    type: [ParticipantDTO],
  })
  @Expose()
  suppliers: ParticipantDTO[];

  @ApiProperty({
    type: CompanyDTO,
  })
  @Expose()
  buyerCompany: CompanyDTO;

  @ApiProperty({
    type: CompanyDTO,
  })
  @Expose()
  supplierCompany: CompanyDTO;

  @ApiProperty()
  @Expose()
  new: boolean;

  @ApiProperty()
  @Expose()
  newDocuments: boolean;

  @ApiProperty()
  @Expose()
  isPublished: boolean;
}
