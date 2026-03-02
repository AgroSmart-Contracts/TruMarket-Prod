import { TestApp } from './utils';

describe('Misc Routes (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
  });

  afterEach(async () => {
    await app.teardown();
  });

  it('/ (GET)', () => {
    return app.request().get('/').expect(200).expect('v0.0.0');
  });

  it('/health (GET)', () => {
    return app
      .request()
      .get('/health')
      .expect(200)
      .expect('{"status":"UP","services":{"database":"UP"}}');
  });

  describe('Authentication', () => {
    it('should login', async () => {
      const res = await app
        .request()
        .post('/auth/login')
        .send({ web3authToken: '{}' })
        .expect(201);

      expect(res.body).toHaveProperty('token');
    });
  });
});
