import { Module } from '@nestjs/common';
import { Configuration, DefaultApi, Region } from '@onfido/api';

import { DatabaseModule } from '@/database/database.module';
import { UsersModule } from '@/users/users.module';

import { KYCController } from './kyc.controller';
import { KYCService } from './kyc.service';

@Module({
  controllers: [KYCController],
  providers: [
    KYCService,
    {
      provide: DefaultApi,
      useFactory: () => {
        const onfidoApiToken = process.env.ONFIDO_API_TOKEN;

        if (!onfidoApiToken) {
          console.warn('ONFIDO_API_TOKEN is not defined. KYC features will not work.');
          // Return a default instance to prevent app crash
          // API calls will fail, but the app will start
          return new DefaultApi(
            new Configuration({
              apiToken: 'dummy-token',
              region: Region.EU,
              baseOptions: { timeout: 60_000 },
            }),
          );
        }

        return new DefaultApi(
          new Configuration({
            apiToken: onfidoApiToken,
            region: Region.EU, // Supports Region.EU, Region.US and Region.CA
            baseOptions: { timeout: 60_000 }, // Additional Axios options (timeout, etc.)
          }),
        );
      },
    },
  ],
  imports: [UsersModule, DatabaseModule],
  exports: [KYCService],
})
export class KYCModule { }
