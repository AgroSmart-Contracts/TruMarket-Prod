export const osnConfig = {
  baseUrl: process.env.OSN_BASE_URL || '',
  apiKey: process.env.OSN_API_KEY || '',

  // OSN API base path is `/api/v4/`
  apiVersionPrefix: '/api/v4',

  requestTimeoutMs: Number(process.env.OSN_REQUEST_TIMEOUT_MS || 15000),
};
