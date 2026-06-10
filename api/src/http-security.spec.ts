import { resolveCorsAllowedOrigins } from './http-security';

describe('http-security', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CORS_ALLOWED_ORIGINS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('includes default TruMarket production origins', () => {
    const origins = resolveCorsAllowedOrigins();
    expect(origins).toContain('https://app.trumarket.tech');
    expect(origins).toContain('https://finance.trumarket.tech');
    expect(origins).toContain('https://www.trumarket.tech');
  });

  it('merges CORS_ALLOWED_ORIGINS from env', () => {
    process.env.CORS_ALLOWED_ORIGINS =
      'https://waitlist.trumarket.tech,https://preview.example.com';
    const origins = resolveCorsAllowedOrigins();
    expect(origins).toContain('https://waitlist.trumarket.tech');
    expect(origins).toContain('https://preview.example.com');
  });
});
