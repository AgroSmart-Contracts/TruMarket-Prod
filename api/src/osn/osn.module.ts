import { Module } from '@nestjs/common';

import { OsnService } from './osn.service';
import { OsnController } from './osn.controller';

@Module({
  controllers: [OsnController],
  providers: [OsnService],
  exports: [OsnService],
})
export class OsnModule {}

