import { config } from '@/config';
import { AccountType, User } from '@/users/users.entities';

import { TestApp } from './utils';

describe('Notifications (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
  });

  afterEach(async () => {
    await app.teardown();
  });

  describe('notifications', () => {
    it('notification should be generated on creating deals, and user should be able to set notification as read', async () => {
      const buyer = await app.createUser({
        accountType: AccountType.Buyer,
      } as User);

      // setup deal
      const { deal, buyerToken, supplierToken } = await app.setupDeal(
        { nftID: 3 },
        buyer,
        null,
      );

      const supplierNotificationsReq = await app
        .request()
        .get(`/notifications`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(supplierNotificationsReq.body).toMatchObject([
        {
          dealId: deal.id,
          message: `${buyer.email} assigned you to the 'test' shipment agreement.`,
          read: false,
          redirectUrl: `${config.appDomain}/dashboard/agreement-details/${deal.id}`,
          subject: 'Agreement assigned to you',
        },
      ]);

      const buyerNotificationsReq = await app
        .request()
        .get(`/notifications`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(buyerNotificationsReq.body).toMatchObject([
        {
          dealId: deal.id,
          message:
            "All parties accepted the 'test' shipment agreement. The shipment is ready to get started!",
          read: false,
          redirectUrl: `${config.appDomain}/dashboard/shipment-details/${deal.id}`,
          subject: 'Agreement accepted',
        },
      ]);

      // set supplier notification as read
      await app
        .request()
        .put(`/notifications`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send({ read: true, dealId: deal.id })
        .expect(200);

      const supplierNotificationsReadReq = await app
        .request()
        .get(`/notifications`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(supplierNotificationsReadReq.body).toMatchObject([
        {
          dealId: deal.id,
          message: `${buyer.email} assigned you to the 'test' shipment agreement.`,
          read: true,
          redirectUrl: `${config.appDomain}/dashboard/agreement-details/${deal.id}`,
          subject: 'Agreement assigned to you',
        },
      ]);

      // set buyer notification as read
      await app
        .request()
        .put(`/notifications`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ read: true, id: buyerNotificationsReq.body[0].id })
        .expect(200);

      const buyerNotificationsReadReq = await app
        .request()
        .get(`/notifications`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(buyerNotificationsReadReq.body).toMatchObject([
        {
          dealId: deal.id,
          message:
            "All parties accepted the 'test' shipment agreement. The shipment is ready to get started!",
          read: true,
          redirectUrl: `${config.appDomain}/dashboard/shipment-details/${deal.id}`,
          subject: 'Agreement accepted',
        },
      ]);
    });
  });
});
