import { Inject, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SentryModule } from '@sentry/nestjs/setup';
import * as fs from 'fs';
import { Connection } from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import * as path from 'path';
import pino from 'pino';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { CctpModule } from './cctp/cctp.module';
import { config } from './config';
import { providers } from './constants';
import { DatabaseModule } from './database/database.module';
import { DealsModule } from './deals/deals.module';
import { connectDB } from './infra/database/connectDB';
import { loggerOptions } from './logger';
import { PaymentsModule } from './payments/payments.module';
import { PdfClassificationModule } from './pdf-classification/pdf-classification.module';
import { OsnRuntimeSettingsModule } from './settings/osn-runtime-settings.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

// ConfigModule must be loaded FIRST to ensure .env files are loaded before config.ts is evaluated
const modules = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env', '.env.local', '.env.development'],
    expandVariables: true,
  }),
  SentryModule.forRoot(),
  JwtModule.register({
    secret: config.jwtSecret,
    signOptions: { expiresIn: '1d' },
    global: true,
  }),
  DatabaseModule,
  PdfClassificationModule,
  AdminModule,
  AuthModule,
  UsersModule,
  DealsModule,
  PaymentsModule,
  BankAccountsModule,
  CctpModule,
  OsnRuntimeSettingsModule,
  StorageModule,
];

if (!process.env.E2E_TEST) {
  modules.unshift(
    LoggerModule.forRoot({
      pinoHttp:
        config.env === 'development' || config.prettyLogs
          ? {
              serializers: {
                req: ({ id, method, url, params, query }) => {
                  return {
                    id,
                    method,
                    url,
                    params,
                    query,
                  };
                },
                res: ({ statusCode }) => {
                  return { statusCode };
                },
              },
              transport: { target: 'pino-pretty' },
              stream: (() => {
                // Skip file logging in serverless environments (Vercel)
                if (process.env.VERCEL) {
                  return pino.destination({ dest: 1, sync: false });
                }
                try {
                  const logDir = path.dirname(config.logsDestination);
                  // Create directory if it doesn't exist
                  if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                  }
                  return pino.destination({
                    dest: config.logsDestination,
                    colorize: true,
                    sync: false,
                  });
                } catch (err) {
                  // Fallback to stdout if file logging fails
                  console.warn(
                    `Could not set up file logging: ${err.message}. Logging to stdout only.`,
                  );
                  return pino.destination({ dest: 1, sync: false });
                }
              })(),
              redact: {
                paths: ['req.headers.authorization', 'req.headers.cookie'],
                censor: '**REDACTED**',
              },
            }
          : loggerOptions,
      forRoutes: ['*'],
    }),
  );
}

@Module({
  imports: modules,
  controllers: [AppController],
  providers: [
    {
      provide: providers.DatabaseConnection,
      useFactory: async (): Promise<Connection> =>
        await connectDB(config.databaseUrl),
    },
  ],
})
export class AppModule {
  constructor(@Inject(providers.DatabaseConnection) private dbClient) {}

  async onModuleDestroy() {
    await this.dbClient.close();
  }
}
