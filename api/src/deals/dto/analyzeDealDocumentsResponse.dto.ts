import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnalyzedDocumentDto {
  @ApiProperty()
  @Expose()
  fileName: string;

  @ApiProperty()
  @Expose()
  detectedType: string;

  @ApiProperty({ required: false })
  @Expose()
  tradePdfClassification?: {
    detectedType: string;
    score: number;
    matchedKeywords: string[];
  };

  @ApiProperty({ required: false })
  @Expose()
  suggestedDescription: string;
}

export class DealFieldSuggestionsDto {
  @ApiProperty({ required: false })
  @Expose()
  name?: string;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty({ required: false })
  @Expose()
  quantity?: number;

  @ApiProperty({ required: false })
  @Expose()
  offerUnitPrice?: number;

  @ApiProperty({ required: false })
  @Expose()
  variety?: string;

  @ApiProperty({ required: false })
  @Expose()
  quality?: string;

  @ApiProperty({ required: false })
  @Expose()
  presentation?: string;

  @ApiProperty({ required: false })
  @Expose()
  origin?: string;

  @ApiProperty({ required: false })
  @Expose()
  destination?: string;

  @ApiProperty({ required: false })
  @Expose()
  portOfOrigin?: string;

  @ApiProperty({ required: false })
  @Expose()
  portOfDestination?: string;

  @ApiProperty({ required: false, enum: ['sea_freight', 'by_air'] })
  @Expose()
  transport?: string;

  @ApiProperty({ required: false })
  @Expose()
  shippingStartDate?: string;

  @ApiProperty({ required: false })
  @Expose()
  expectedShippingEndDate?: string;

  @ApiProperty({ required: false })
  @Expose()
  totalValue?: number;

  @ApiProperty({ required: false })
  @Expose()
  investmentAmount?: number;

  @ApiProperty({ required: false })
  @Expose()
  buyerCompanyName?: string;

  @ApiProperty({ required: false })
  @Expose()
  buyerCompanyCountry?: string;

  @ApiProperty({ required: false })
  @Expose()
  supplierCompanyName?: string;

  @ApiProperty({ required: false })
  @Expose()
  supplierCompanyCountry?: string;
}

export class AnalyzeDealDocumentsResponseDto {
  @ApiProperty({ type: [AnalyzedDocumentDto] })
  @Expose()
  documents: AnalyzedDocumentDto[];

  @ApiProperty({ type: DealFieldSuggestionsDto })
  @Expose()
  suggestions: DealFieldSuggestionsDto;

  @ApiProperty({ type: [String] })
  @Expose()
  filledFields: string[];

  @ApiProperty({
    required: false,
    description:
      'Human-readable map of values detected across all uploaded PDFs',
  })
  @Expose()
  detectedFields?: Record<string, string>;
}
