import './load-env';
import './instrument';

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import * as webpush from 'web-push';

import { AppModule } from './app.module';
import { config } from './config';
import { ErrorsFilter } from './errors.filter';
import { buildCorsOptions, securityHeadersMiddleware } from './http-security';
import { logger } from './logger';

// Set VAPID details only if keys are provided, otherwise just log a warning
try {
  if (config.vapidPublicKey && config.vapidPrivateKey && config.mailTo) {
    webpush.setVapidDetails(
      'mailto:' + config.mailTo,
      config.vapidPublicKey,
      config.vapidPrivateKey,
    );
  } else {
    logger.warn('VAPID keys not configured. Push notifications will not work.');
  }
} catch (err) {
  logger.warn(
    { err },
    'Failed to set VAPID details. Push notifications will not work.',
  );
}

async function bootstrap() {
  logger.info('Starting server...');
  const app = await NestFactory.create(AppModule);

  app.use(securityHeadersMiddleware);

  // Handle favicon requests before setting global prefix
  // Browsers and tools automatically request various favicon files, but APIs don't need them
  app.use('/favicon.ico', (req, res) => res.status(204).send());
  app.use('/favicon.png', (req, res) => res.status(204).send());
  app.use('/favicon.svg', (req, res) => res.status(204).send());

  // ✅ Handle GET / (prevents noisy 404s from browsers/uptime checks)
  app.use('/', (req, res, next) => {
    if (req.method === 'GET' && req.path === '/') {
      const isProd = process.env.NODE_ENV === 'production';
      return res.status(200).json({
        ok: true,
        name: 'TruMarket Shipment API',
        apiBase: isProd ? '/api/v2' : '/',
        docs: isProd ? '/api/v2/docs' : '/docs',
      });
    }
    next();
  });

  let docsPrefix = 'docs';

  if (process.env.NODE_ENV === 'production') {
    app.setGlobalPrefix('api/v2');
    docsPrefix = 'api/v2/docs';
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TruMarket Shipment API')
    .setVersion('1.1')
    .addTag('TruMarket')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(docsPrefix, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  if (process.env.E2E_TEST) {
    app.useLogger(false);
  } else {
    app.useLogger(app.get(Logger));
  }

  if (process.env.E2E_TEST) {
    app.enableCors({
      origin: true,
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
      exposedHeaders: ['Content-Type', 'Content-Length'],
    });
  } else {
    app.enableCors(buildCorsOptions());
  }

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeUnsetFields: false,
        excludeExtraneousValues: true,
      },
    }),
  );

  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector, {
      excludeExtraneousValues: true,
    }),
  );

  // NOTE: Cron jobs are not reliable in serverless environments (instances can sleep/scale to zero).
  // If you need this every minute in production on Vercel, use Vercel Cron Jobs instead.
  // DISABLED: Deals logs sync is disabled to reduce Alchemy RPC usage. Code is kept for future use.
  // schedule.scheduleJob('* * * * *', syncDealsLogs);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
