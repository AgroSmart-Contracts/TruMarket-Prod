import { DealStatus } from '@/deals/deals.entities';
import { RoleType } from '@/users/users.entities';

import { TestApp } from './utils';

describe('Admin Routes (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
  });

  afterEach(async () => {
    await app.teardown();
  });

  it('regular users cannot access admin routes', async () => {
    const regular = await app.createUser({ role: RoleType.REGULAR });

    const regularToken = await app.login(regular);

    const routes = [
      { method: 'get', route: '/admin/deals' },
      { method: 'get', route: '/admin/deals/1234' },
      { method: 'delete', route: '/admin/deals/1234' },
      { method: 'post', route: '/admin/deals/1234/nft/mint' },
    ];

    for (const { method, route } of routes) {
      await app
        .request()
        [method](route)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    }
  });

  it('/admin/deals (GET)', async () => {
    const admin = await app.createUser({ role: RoleType.ADMIN });

    const adminToken = await app.login(admin);

    for (let i = 0; i < 25; i++) {
      await app.setupDeal();
      await app.setupProposalDeal();
    }

    const { buyer } = await app.setupDeal();
    const { supplier } = await app.setupDeal();

    // Get all deals

    const dealsReq = await app
      .request()
      .get('/admin/deals')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(dealsReq.body.data).toHaveLength(20);
    expect(dealsReq.body.nextOffset).toEqual(20);

    // Filter Deals by status

    const proposalDealsReq = await app
      .request()
      .get(`/admin/deals?status=${DealStatus.Proposal}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(proposalDealsReq.body.data).toHaveLength(20);
    expect(proposalDealsReq.body.nextOffset).toEqual(20);

    const proposalDealsReq2 = await app
      .request()
      .get(
        `/admin/deals?status=${DealStatus.Proposal}&offset=${proposalDealsReq.body.nextOffset}`,
      )
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(proposalDealsReq2.body.data).toHaveLength(5);
    expect(proposalDealsReq2.body.nextOffset).toEqual(0);

    // Filter Deals by buyer email

    const buyerDealsReq = await app
      .request()
      .get(`/admin/deals?emailSearch=${buyer.email}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(buyerDealsReq.body.data).toHaveLength(1);
    expect(buyerDealsReq.body.nextOffset).toEqual(0);

    const supplierDealsReq = await app
      .request()
      .get(`/admin/deals?emailSearch=${supplier.email}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(supplierDealsReq.body.data).toHaveLength(1);
    expect(supplierDealsReq.body.nextOffset).toEqual(0);

    // Filter Deals by buyer email and status

    const buyerProposalDealsReq = await app
      .request()
      .get(
        `/admin/deals?emailSearch=${buyer.email}&status=${DealStatus.Proposal}`,
      )
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(buyerProposalDealsReq.body.data).toHaveLength(0);
    expect(buyerProposalDealsReq.body.nextOffset).toEqual(0);

    const buyerConfirmedDealsReq = await app
      .request()
      .get(
        `/admin/deals?emailSearch=${buyer.email}&status=${DealStatus.Confirmed}`,
      )
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(buyerConfirmedDealsReq.body.data).toHaveLength(1);
    expect(buyerConfirmedDealsReq.body.nextOffset).toEqual(0);
  }, 30000);

  it('/admin/deals/:dealId (GET)', async () => {
    const admin = await app.createUser({ role: RoleType.ADMIN });

    const adminToken = await app.login(admin);

    const { deal } = await app.setupDeal();

    const dealsReq = await app
      .request()
      .get(`/admin/deals/${deal.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(dealsReq.body.id).toEqual(deal.id);
  });
});
