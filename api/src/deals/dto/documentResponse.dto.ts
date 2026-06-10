import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class documentResponseDTO {
  constructor(res: documentResponseDTO) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  url: string;

  @ApiProperty({ required: false, description: 'normal | payment | drawback' })
  @Expose()
  documentUploadMode?: string;

  @ApiProperty({ required: false })
  @Expose()
  tradePdfClassification?: {
    detectedType: string;
    score: number;
    matchedKeywords: string[];
  };

  @ApiProperty({ required: false })
  @Expose()
  peruDrawbackClassification?: {
    detectedType: string;
    score: number;
    matchedKeywords: string[];
    processStage?: number;
    documentDateIso?: string;
    boxCount?: number | null;
    validationRulesetId?: string;
    validationRulesVersion?: number;
  };

  @ApiProperty({ required: false })
  @Expose()
  verifiedByAdmin?: boolean;

  @ApiProperty({ required: false })
  @Expose()
  verifiedAt?: Date;
}
