import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Deal, DealStatus } from '../deals.entities';
import { CompanyDTO, ParticipantDTO } from './dealResponse.dto';
import { MilestoneResponseDto } from './milestoneResponse.dto';

export class ListDealDtoResponse {
  constructor(res: Partial<Deal>) {
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
  carbonFootprint: string;

  // shipping properties

  @ApiProperty()
  @Expose()
  contractId: number;

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
  totalValue: number;

  @ApiProperty()
  @Expose()
  transport: string;

  @ApiProperty()
  @Expose()
  shippingStartDate: Date;

  @ApiProperty()
  @Expose()
  expectedShippingEndDate: Date;

  @ApiProperty()
  @Expose()
  daysLeft: number;

  @ApiProperty()
  @Expose()
  duration: string;

  // state properties
  @ApiProperty()
  @Expose()
  currentMilestone: number;

  @ApiProperty({ type: MilestoneResponseDto, isArray: true })
  @Expose()
  milestones: MilestoneResponseDto[];

  @ApiProperty({ enum: DealStatus })
  @Expose()
  status: DealStatus;

  // financial properties

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

  // ownership properties

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

  // ui helper properties
  @ApiProperty()
  @Expose()
  new: boolean;

  @ApiProperty()
  @Expose()
  newDocuments: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
