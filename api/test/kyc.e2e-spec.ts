import { providers } from '@/constants';
import { KYCVerification } from '@/kyc/dto/kycVerificationResponse.dto';
import { KYCVerificationRepository } from '@/kyc/kyc.repository';
import { User } from '@/users/users.entities';
import { UsersRepository } from '@/users/users.repository';

import { TestApp } from './utils';

const mockedReadPayload = jest.fn();

jest.mock('@onfido/api', () => {
  return {
    Region: {
      EU: 'EU',
    },
    DefaultApi: jest.fn().mockImplementation(() => {
      return {
        createApplicant: jest.fn().mockResolvedValue({
          data: {
            id: 'applicantId',
          },
        }),
        createWorkflowRun: jest.fn().mockResolvedValue({
          data: {
            id: 'workflowRunId',
          },
        }),
        generateSdkToken: jest.fn().mockResolvedValue({
          data: {
            token: 'sdkToken',
          },
        }),
      };
    }),
    Configuration: jest.fn().mockImplementation(() => {
      return {
        apiKey: 'test',
        region: 'EU',
      };
    }),
    WebhookEventVerifier: jest.fn().mockImplementation(() => {
      return {
        readPayload: mockedReadPayload,
      };
    }),
  };
});

describe('Create new KYC Verification (e2e)', () => {
  let app: TestApp;
  let verificationRepository: KYCVerificationRepository;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    verificationRepository = app.app.get<KYCVerificationRepository>(
      providers.KYCRepository,
    );
    usersRepository = app.app.get<UsersRepository>(providers.UsersRepository);
  });

  afterEach(async () => {
    await app.teardown();
  });

  it('should create a new KYC verification', async () => {
    const user = await app.createUser({});
    const token = await app.login(user);

    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      line1: '123 Fake St',
      state: 'NY',
      postcode: '10001',
      country: 'USA',
      town: 'New York',
    };

    const res = await app
      .request()
      .post('/kyc/verifications')
      .send(payload)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      userId: user.id,
      status: 'notStarted',
      attempts: 0,
      applicantId: 'applicantId',
      workflowRunId: 'workflowRunId',
    });
  });

  it('should not create a new KYC verification if one already exists', async () => {
    const user = await app.createUser({});
    const token = await app.login(user);

    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      line1: '123 Fake St',
      state: 'NY',
      postcode: '10001',
      country: 'USA',
      town: 'New York',
    };

    await app
      .request()
      .post('/kyc/verifications')
      .send(payload)
      .set('Authorization', `Bearer ${token}`);

    const res = await app
      .request()
      .post('/kyc/verifications')
      .send(payload)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('should get sdk token for KYC verification already created', async () => {
    const user = await app.createUser({});
    const token = await app.login(user);

    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      line1: '123 Fake St',
      state: 'NY',
      postcode: '10001',
      country: 'USA',
      town: 'New York',
    };

    await app
      .request()
      .post('/kyc/verifications')
      .send(payload)
      .set('Authorization', `Bearer ${token}`);

    const res = await app
      .request()
      .post('/kyc/sdkToken')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      sdkToken: expect.any(String),
      workflowRunId: 'workflowRunId',
    });
  });

  it('should validate webhook', async () => {
    const user = await app.createUser({});
    const token = await app.login(user);

    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      line1: '123 Fake St',
      state: 'NY',
      postcode: '10001',
      country: 'USA',
      town: 'New York',
    };

    const verificationRes = await app
      .request()
      .post('/kyc/verifications')
      .send(payload)
      .set('Authorization', `Bearer ${token}`);

    const data = {
      payload: {
        action: 'workflow_run.completed',
        resource: {
          applicant_id: verificationRes.body.applicantId,
        },
        object: {
          id: 'test',
          status: 'approved',
        },
      },
    };

    mockedReadPayload.mockReturnValue(data);

    const verification: any = {
      id: 'test',
      applicantId: 'applicantId',
    };

    jest.spyOn(verificationRepository, 'updateById').mockImplementation(
      jest.fn((...params) => {
        expect(params[0]).toStrictEqual(expect.any(String));
        expect(params[1]).toMatchObject({
          status: 'complete',
          result: 'pass',
        });
        return Promise.resolve(verification as KYCVerification);
      }),
    );

    jest.spyOn(usersRepository, 'updateById').mockImplementation(
      jest.fn((...params) => {
        expect(params[0]).toStrictEqual(expect.any(String));
        expect(params[1]).toMatchObject({
          kycVerified: true,
        });

        return Promise.resolve(user as User);
      }),
    );

    const res = await app.request().post('/kyc/webhook').send(data);

    expect(res.status).toBe(201);
  });
});
