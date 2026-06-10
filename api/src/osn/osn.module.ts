import { Module } from '@nestjs/common';

import { OsnController } from './osn.controller';
import { OsnService } from './osn.service';

@Module({
  controllers: [OsnController],
  providers: [OsnService],
  exports: [OsnService],
})
export class OsnModule {}
