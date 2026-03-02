import { MilestoneStatus } from '@/deals/deals.entities';
import { AccountType } from '@/users/users.entities';

import { TestApp } from './utils';

describe('List deals (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
  });

  afterEach(async () => {
    await app.teardown();
  });

  it('list deals details', async () => {
    const { buyerToken } = await app.setupDeal();

    const dealsReq = await app
      .request()
      .get('/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(dealsReq.body).toHaveLength(1);
    expect(dealsReq.body[0].id).toBeDefined();
    expect(dealsReq.body[0].shippingStartDate).toBeDefined();
    expect(dealsReq.body[0].buyers).toHaveLength(1);
    expect(dealsReq.body[0].suppliers).toHaveLength(1);
    expect(dealsReq.body[0].expectedShippingEndDate).toBeDefined();

    expect(dealsReq.body[0]).toMatchObject({
      buyers: [{ approved: true }],
      suppliers: [{ approved: true }],
      contractId: 1,
      currentMilestone: 0,
      daysLeft: -1,
      description: 'test',
      destination: 'US',
      duration: '0 weeks',
      investmentAmount: 1,
      milestones: [
        {
          description: 'Description of Milestone 1',
          docs: [],
          fundsDistribution: 20,
          status: MilestoneStatus.InProgress,
        },
        {
          description: 'Description of Milestone 2',
          docs: [],
          fundsDistribution: 50,
          status: MilestoneStatus.NotCompleted,
        },
        {
          description: 'Description of Milestone 3',
          docs: [],
          fundsDistribution: 0,
          status: MilestoneStatus.NotCompleted,
        },
        {
          description: 'Description of Milestone 4',
          docs: [],
          fundsDistribution: 0,
          status: MilestoneStatus.NotCompleted,
        },
        {
          description: 'Description of Milestone 5',
          docs: [],
          fundsDistribution: 0,
          status: MilestoneStatus.NotCompleted,
        },
        {
          description: 'Description of Milestone 6',
          docs: [],
          fundsDistribution: 0,
          status: MilestoneStatus.NotCompleted,
        },
        {
          description: 'Description of Milestone 7',
          docs: [],
          fundsDistribution: 30,
          status: MilestoneStatus.NotCompleted,
        },
      ],
      name: 'test',
      netBalance: 1,
      origin: 'CN',
      portOfDestination: 'US',
      portOfOrigin: 'CN',
      revenue: 1,
      roi: 1,
      status: 'confirmed',
      totalValue: 1,
      transport: 'ship',
    });
  });

  it('list user deals by status', async () => {
    const buyer = await app.createUser({
      accountType: AccountType.Buyer,
    });

    const deal = await app.createUserDeal(buyer);
    const dealConfirmed = await app.createUserConfirmedDeal(buyer);

    const dealsReq = await app
      .request()
      .get('/deals')
      .set('Authorization', `Bearer ${await app.login(buyer)}`)
      .expect(200);

    expect(dealsReq.body).toHaveLength(2);
    expect(dealsReq.body.map((d) => d.id)).toContain(deal.id);
    expect(dealsReq.body.map((d) => d.id)).toContain(dealConfirmed.id);

    const proposalDealsRequest = await app
      .request()
      .get('/deals?status=proposal')
      .set('Authorization', `Bearer ${await app.login(buyer)}`)
      .expect(200);

    expect(proposalDealsRequest.body).toHaveLength(1);
    expect(proposalDealsRequest.body.map((d) => d.id)).toContain(deal.id);

    const confirmedDealsRequest = await app
      .request()
      .get('/deals?status=confirmed')
      .set('Authorization', `Bearer ${await app.login(buyer)}`)
      .expect(200);

    expect(confirmedDealsRequest.body).toHaveLength(1);
    expect(confirmedDealsRequest.body.map((d) => d.id)).toContain(
      dealConfirmed.id,
    );
  });
});
