import { Module } from '@nestjs/common';

import { CctpController } from './cctp.controller';

@Module({
  controllers: [CctpController],
})
export class CctpModule {}
