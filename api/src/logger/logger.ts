import * as fs from 'fs';
import * as path from 'path';
import pino, { type Logger, type LoggerOptions } from 'pino';

import { config } from '../config';

const pinoOptions: LoggerOptions = { level: config.logLevel };
let pinoTransport: any;
let pinoLogger: Logger;

if (config.env === 'development' || config.prettyLogs) {
  const targets: any[] = [
    {
      target: 'pino-pretty',
      level: 'trace',
      options: { destination: 1, colorize: true }, // Always log to stdout
    },
  ];

  // Try to add file destination, but fallback to stdout if it fails
  // Skip file logging in serverless environments (Vercel, etc.)
  if (!process.env.VERCEL) {
    try {
      const logDir = path.dirname(config.logsDestination);
      // Create directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      // Add file destination
      targets.unshift({
        target: 'pino-pretty',
        level: 'trace',
        options: {
          destination: config.logsDestination,
          colorize: true,
        },
      });
    } catch (err) {
      // If file logging fails, just use stdout (already added above)
      console.warn(`Could not set up file logging: ${err.message}. Logging to stdout only.`);
    }
  }

  pinoTransport = pino.transport({
    targets,
  });
}

// eslint-disable-next-line
pinoLogger = pino(pinoOptions, pinoTransport);

export const loggerOptions = pinoOptions;
export const logger = pinoLogger;
