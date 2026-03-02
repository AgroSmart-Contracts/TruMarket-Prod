import { Inject, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SentryModule } from '@sentry/nestjs/setup';
import { Connection } from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { config } from './config';
import { providers } from './constants';
import { DatabaseModule } from './database/database.module';
import { DealsModule } from './deals/deals.module';
import { connectDB } from './infra/database/connectDB';
import { KYCModule } from './kyc/kyc.module';
import { loggerOptions } from './logger';
import { UsersModule } from './users/users.module';

import { ConfigModule } from '@nestjs/config';

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
  AdminModule,
  AuthModule,
  UsersModule,
  DealsModule,
  KYCModule,
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
                const fs = require('fs');
                const path = require('path');
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
                console.warn(`Could not set up file logging: ${err.message}. Logging to stdout only.`);
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
  constructor(@Inject(providers.DatabaseConnection) private dbClient) { }

  async onModuleDestroy() {
    await this.dbClient.close();
  }
}
