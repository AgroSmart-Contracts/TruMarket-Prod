import { DealStatus, MilestoneApprovalStatus } from '@/deals/deals.entities';

import { TestApp } from './utils';

describe('Milestone approval flows (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
  });

  afterEach(async () => {
    await app.teardown();
  });

  it('supplier submit review request, buyer deny it, supplier submit review request again, buyer approves it', async () => {
    // setup deal
    const { deal, buyerToken, supplierToken } = await app.setupDeal(
      { nftID: 1 },
      null,
      null,
    );

    expect(deal.currentMilestone).toEqual(0);

    // supplier uploads document to current milestone
    const milestone = deal.milestones[deal.currentMilestone];

    const buyerRequestReviewReq = await app
      .request()
      .put(`/deals/${deal.id}/milestones/${milestone.id}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ submitToReview: true })
      .expect(401);

    expect(buyerRequestReviewReq.body.message).toEqual(
      'Only supplier can submit milestone review request',
    );

    const supplierRequestReviewReq = await app
      .request()
      .put(`/deals/${deal.id}/milestones/${milestone.id}`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ submitToReview: true })
      .expect(200);

    expect(supplierRequestReviewReq.body).toMatchObject({
      approvalStatus: MilestoneApprovalStatus.Submitted,
    });

    const rejectedSupplierRequestReviewReq = await app
      .request()
      .put(`/deals/${deal.id}/milestones/${milestone.id}`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ submitToReview: true })
      .expect(400);

    expect(rejectedSupplierRequestReviewReq.body.message).toEqual(
      'Milestone is not pending or denied',
    );

    const supplierDenyRequestReviewReq = await app
      .request()
      .put(`/deals/${deal.id}/milestones/${milestone.id}`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ deny: true })
      .expect(401);

    expect(supplierDenyRequestReviewReq.body.message).toEqual(
      'Only buyer can deny milestone',
    );

    const buyerDenyRequestReviewReq = await app
      .request()
      .put(`/deals/${deal.id}/milestones/${milestone.id}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ deny: true })
      .expect(200);

    expect(buyerDenyRequestReviewReq.body).toMatchObject({
      approvalStatus: MilestoneApprovalStatus.Denied,
    });

    const supplierSecondRequestReviewReq = await app
      .request()
      .put(`/deals/${deal.id}/milestones/${milestone.id}`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ submitToReview: true })
      .expect(200);

    expect(supplierSecondRequestReviewReq.body).toMatchObject({
      approvalStatus: MilestoneApprovalStatus.Submitted,
    });

    const buyerApproveRequestReviewReq = await app
      .request()
      .put(`/deals/${deal.id}/milestones/${milestone.id}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ approve: true });

    expect(buyerApproveRequestReviewReq.body).toHaveProperty('id');
    expect(buyerApproveRequestReviewReq.status).toEqual(200);

    expect(buyerApproveRequestReviewReq.body).toMatchObject({
      approvalStatus: MilestoneApprovalStatus.Approved,
    });

    const dealReq = await app
      .request()
      .get(`/deals/${deal.id}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(dealReq.body).toMatchObject({
      currentMilestone: 1,
    });
  });

  it('should approve all milestones', async () => {
    // setup deal
    const { deal, buyerToken, supplierToken } = await app.setupDeal(
      { nftID: 1 },
      null,
      null,
    );

    expect(deal.currentMilestone).toEqual(0);

    // supplier uploads document to current milestone

    for (let i = 0; i < deal.milestones.length; i++) {
      const milestone = deal.milestones[i];

      await app
        .request()
        .put(`/deals/${deal.id}/milestones/${milestone.id}`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send({ submitToReview: true })
        .expect(200);

      const approvalReq = await app
        .request()
        .put(`/deals/${deal.id}/milestones/${milestone.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ approve: true });

      expect(approvalReq.body).toHaveProperty('id');
      expect(approvalReq.status).toEqual(200);
    }

    const dealReq = await app
      .request()
      .get(`/deals/${deal.id}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(dealReq.body).toMatchObject({
      currentMilestone: 7,
      status: DealStatus.Finished,
    });
  });
});
