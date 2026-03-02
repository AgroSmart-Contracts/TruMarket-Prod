import { AccountType, User } from '@/users/users.entities';

import { TestApp } from './utils';

describe('Update Deal (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
  });

  afterEach(async () => {
    await app.teardown();
  });

  describe('setDealAsViewed', () => {
    it('should set deal as viewed for supplier', async () => {
      const buyer = await app.createUser({
        accountType: AccountType.Buyer,
      } as User);
      const supplier = await app.createUser({
        accountType: AccountType.Supplier,
      } as User);

      const supplierToken = await app.login(supplier);
      const buyerToken = await app.login(buyer);

      const { deal } = await app.setupProposalDeal({}, buyer, supplier);

      const getDealReq = await app
        .request()
        .get(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(getDealReq.body).toHaveProperty('id');
      expect(getDealReq.body.new).toBeTruthy();

      const getBuyerDealsListReq = await app
        .request()
        .get(`/deals`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(getBuyerDealsListReq.body).toHaveLength(1);
      expect(getBuyerDealsListReq.body[0].new).toBeFalsy();

      const getDealsListReq = await app
        .request()
        .get(`/deals`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(getDealsListReq.body).toHaveLength(1);
      expect(getDealsListReq.body[0].new).toBeTruthy();

      const updateDealReq = await app
        .request()
        .put(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send({ view: true });

      expect(updateDealReq.body).toHaveProperty('id');
      expect(updateDealReq.body.new).toBeFalsy();

      const getDealUpdatedReq = await app
        .request()
        .get(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(getDealUpdatedReq.body).toHaveProperty('id');
      expect(getDealUpdatedReq.body.new).toBeFalsy();

      const getDealsListUpdatedReq = await app
        .request()
        .get(`/deals`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(getDealsListUpdatedReq.body).toHaveLength(1);
      expect(getDealsListUpdatedReq.body[0].new).toBeFalsy();
    });

    it('should set deal as new for multiple participants', async () => {
      const buyer1 = await app.createUser({
        accountType: AccountType.Buyer,
      } as User);
      const buyer2 = await app.createUser({
        accountType: AccountType.Buyer,
      } as User);
      const supplier1 = await app.createUser({
        accountType: AccountType.Supplier,
      } as User);
      const supplier2 = await app.createUser({
        accountType: AccountType.Supplier,
      } as User);

      const buyer1Token = await app.login(buyer1);
      const buyer2Token = await app.login(buyer2);
      const supplier1Token = await app.login(supplier1);
      const supplier2Token = await app.login(supplier2);

      const { deal } = await app.setupProposalDeal(
        {
          buyersEmails: [buyer1.email, buyer2.email],
          suppliersEmails: [supplier1.email, supplier2.email],
        },
        buyer1,
        supplier2,
      );

      const buyer1DealReq = await app
        .request()
        .get(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${buyer1Token}`)
        .expect(200);

      expect(buyer1DealReq.body).toHaveProperty('id');
      expect(buyer1DealReq.body.new).toBeFalsy();

      const buyer1ListDealsReq = await app
        .request()
        .get(`/deals`)
        .set('Authorization', `Bearer ${buyer1Token}`)
        .expect(200);

      expect(buyer1ListDealsReq.body[0]).toHaveProperty('id');
      expect(buyer1ListDealsReq.body[0].new).toBeFalsy();

      const buyer2ListDealsReq = await app
        .request()
        .get(`/deals`)
        .set('Authorization', `Bearer ${buyer2Token}`)
        .expect(200);

      expect(buyer2ListDealsReq.body[0]).toHaveProperty('id');
      expect(buyer2ListDealsReq.body[0].new).toBeTruthy();

      const buyer2DealReq = await app
        .request()
        .get(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${buyer2Token}`)
        .expect(200);

      expect(buyer2DealReq.body).toHaveProperty('id');
      expect(buyer2DealReq.body.new).toBeTruthy();

      const supplier1ListDealsReq = await app
        .request()
        .get(`/deals`)
        .set('Authorization', `Bearer ${supplier1Token}`)
        .expect(200);

      expect(supplier1ListDealsReq.body[0]).toHaveProperty('id');
      expect(supplier1ListDealsReq.body[0].new).toBeTruthy();

      const supplier1DealReq = await app
        .request()
        .get(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${supplier1Token}`)
        .expect(200);

      expect(supplier1DealReq.body).toHaveProperty('id');
      expect(supplier1DealReq.body.new).toBeTruthy();

      const supplier2ListDealsReq = await app
        .request()
        .get(`/deals`)
        .set('Authorization', `Bearer ${supplier2Token}`)
        .expect(200);

      expect(supplier2ListDealsReq.body[0]).toHaveProperty('id');
      expect(supplier2ListDealsReq.body[0].new).toBeTruthy();

      const supplier2DealReq = await app
        .request()
        .get(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${supplier2Token}`)
        .expect(200);

      expect(supplier2DealReq.body).toHaveProperty('id');
      expect(supplier2DealReq.body.new).toBeTruthy();
    });
  });

  describe('updateCoverImage', () => {
    it('should update the cover image of a deal', async () => {
      const user = await app.createUser({} as User);

      const userToken = await app.login(user);

      const deal = await app.createUserDeal(user);

      const updateCoverImageReq = await app
        .request()
        .put(`/deals/${deal.id}/cover-image`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', 'test/fixtures/test.png')
        .expect(200);

      expect(updateCoverImageReq.body.coverImageUrl).toBeDefined();
    });
  });

  describe('setDocumentsViewed', () => {
    it('buyer should see deal with new documents tag', async () => {
      const buyer = await app.createUser({
        accountType: AccountType.Buyer,
      } as User);

      // setup deal
      const { deal, buyerToken, supplierToken } = await app.setupDeal(
        { nftID: 3 },
        buyer,
        null,
      );

      // supplier uploads document to current milestone
      const milestone = deal.milestones[deal.currentMilestone];

      const successUploadReq = await app
        .request()
        .post(`/deals/${deal.id}/milestones/${milestone.id}/docs`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .field('description', 'Test document')
        .attach('file', 'test/fixtures/test.pdf');

      expect(successUploadReq.body).toHaveProperty('id');
      expect(successUploadReq.status).toBe(201);

      const dealsWithNewDocsReq = await app
        .request()
        .get(`/deals`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(dealsWithNewDocsReq.body).toHaveLength(1);
      expect(dealsWithNewDocsReq.body[0].newDocuments).toBeTruthy();

      const getDealWithNewDocsReq = await app
        .request()
        .get(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(getDealWithNewDocsReq.body).toHaveProperty('id');
      expect(getDealWithNewDocsReq.body.newDocuments).toBeTruthy();

      const setDealsDocsViewedReq = await app
        .request()
        .put(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ viewDocuments: true });

      expect(setDealsDocsViewedReq.body).toHaveProperty('id');
      expect(setDealsDocsViewedReq.body.newDocuments).toBeFalsy();

      const dealsWithDocsViewedReq = await app
        .request()
        .get(`/deals`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(dealsWithDocsViewedReq.body).toHaveLength(1);
      expect(dealsWithDocsViewedReq.body[0].newDocuments).toBeFalsy();

      const getDealWithDocsViewedReq = await app
        .request()
        .get(`/deals/${deal.id}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(getDealWithDocsViewedReq.body).toHaveProperty('id');
      expect(getDealWithDocsViewedReq.body.newDocuments).toBeFalsy();
    });
  });
});
