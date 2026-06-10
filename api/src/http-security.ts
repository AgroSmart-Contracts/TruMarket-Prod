import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { NextFunction, Request, Response } from 'express';

import { config } from './config';

/** Matches Next.js apps — clickjacking / baseline headers for API + Swagger UI. */
export const SECURITY_RESPONSE_HEADERS: Readonly<Record<string, string>> = {
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
};

const DEFAULT_CORS_ORIGINS = [
  'https://app.trumarket.tech',
  'https://finance.trumarket.tech',
  'https://www.trumarket.tech',
  'https://trumarket.tech',
];

const LOCAL_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function resolveCorsAllowedOrigins(): string[] {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const candidates = [
    ...fromEnv,
    config.appDomain,
    config.adminDashboardUrl,
    ...DEFAULT_CORS_ORIGINS,
  ];

  const normalized = new Set<string>();
  for (const raw of candidates) {
    if (!raw) continue;
    try {
      normalized.add(new URL(raw).origin);
    } catch {
      // ignore invalid URLs
    }
  }
  return [...normalized];
}

function isLocalDevOrigin(origin: string): boolean {
  return LOCAL_DEV_ORIGIN.test(origin);
}

export function buildCorsOptions(): CorsOptions {
  const isProd = process.env.NODE_ENV === 'production';
  const allowed = resolveCorsAllowedOrigins();

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (!isProd && isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }
      if (allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS origin not allowed: ${origin}`), false);
    },
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
    exposedHeaders: ['Content-Type', 'Content-Length'],
  };
}

export function securityHeadersMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  for (const [key, value] of Object.entries(SECURITY_RESPONSE_HEADERS)) {
    res.setHeader(key, value);
  }
  next();
}
