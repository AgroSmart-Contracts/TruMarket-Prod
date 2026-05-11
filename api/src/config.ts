import * as path from 'path';

export const config = {
  databaseUrl: process.env.DATABASE_URL || 'mongodb://mongo',
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'debug',
  prettyLogs: process.env.PRETTY_LOGS === 'true',
  /** Override with LOGS_DESTINATION; Docker/prod often uses `/app/logs/out.log`. */
  logsDestination:
    process.env.LOGS_DESTINATION || path.join(process.cwd(), 'logs', 'out.log'),
  version: process.env.COMMIT_HASH || 'v0.0.0',
  // Storage configuration - using Vercel Blob Storage
  // BLOB_READ_WRITE_TOKEN is required for file uploads
  blobReadWriteToken: process.env.BLOB_API_READ_WRITE_TOKEN || '',
  jwtSecret: process.env.JWT_SECRET || 'yourjsonwebtokensecret',
  auth0Domain: process.env.AUTH0_DOMAIN || 'trumarket-dev.eu.auth0.com',
  blockchainRpcUrl:
    process.env.BLOCKCHAIN_RPC_URL || '',
  blockchainPrivateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
  blockchainChainId: process.env.BLOCKCHAIN_CHAIN_ID || '',
  blockchainExplorer: process.env.BLOCKCHAIN_EXPLORER || '',
  dealsManagerContractAddress: process.env.DEALS_MANAGER_CONTRACT_ADDRESS || '',
  investmentTokenContractAddress:
    process.env.INVESTMENT_TOKEN_CONTRACT_ADDRESS || '',
  investmentTokenSymbol: process.env.INVESTMENT_TOKEN_SYMBOL || '',
  investmentTokenDecimals: process.env.INVESTMENT_TOKEN_DECIMALS || '',
  automaticDealsAcceptance: process.env.AUTOMATIC_DEALS_ACCEPTANCE === 'true',
  emailHost: process.env.EMAIL_HOST || '',
  emailUsername: process.env.EMAIL_USERNAME || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  appDomain: process.env.APP_DOMAIN || 'https://app.trumarket.tech',
  /**
   * Public URL for the logo in HTML emails (`<img src>`). Page links like
   * `https://drive.google.com/file/d/.../view` do not work; use the direct form
   * or host on your CDN. Override with EMAIL_LOGO_URL.
   */
  emailLogoUrl:
    process.env.EMAIL_LOGO_URL?.trim() ||
    'https://drive.google.com/uc?export=view&id=1CWxso8si8m-ogSqGUbGDQ1lz8gXOLPwR',
  mailTo: process.env.MAIL_TO,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  /**
   * Admin-dashboard base URL (server-side only). No trailing slash.
   * Prefer ADMIN_DASHBOARD_URL; ADMIN_DASHBOARD_API_BASE_URL is legacy.
   */
  adminDashboardUrl:
    process.env.ADMIN_DASHBOARD_URL?.trim() ||
    process.env.ADMIN_DASHBOARD_API_BASE_URL?.trim() ||
    '',
  /**
   * Bearer token for TruMarket → admin internal routes. Must match admin-dashboard INTERNAL_API_TOKEN.
   * Prefer ADMIN_DASHBOARD_INTERNAL_TOKEN; INTERNAL_API_TOKEN is legacy.
   */
  adminDashboardInternalToken:
    process.env.ADMIN_DASHBOARD_INTERNAL_TOKEN?.trim() ||
    process.env.INTERNAL_API_TOKEN?.trim() ||
    '',
};
