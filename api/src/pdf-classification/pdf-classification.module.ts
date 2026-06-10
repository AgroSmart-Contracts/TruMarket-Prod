import { Global, Module } from '@nestjs/common';

import { PdfClassificationService } from './pdf-classification.service';

@Global()
@Module({
  providers: [PdfClassificationService],
  exports: [PdfClassificationService],
})
export class PdfClassificationModule {}
