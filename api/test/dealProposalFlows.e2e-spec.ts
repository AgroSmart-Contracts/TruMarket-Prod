import { Deal, DealStatus } from '@/deals/deals.entities';
import UserModel from '@/infra/database/users.model';
import { AccountType, User } from '@/users/users.entities';

import { generateDealDto, randomEvmAddress, TestApp } from './utils';

describe('Deal Proposal Flows (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
  });

  afterEach(async () => {
    await app.teardown();
  });

  it('buyer creates deal proposal and supplier accepts', async () => {
    // create buyer and supplier users
    const buyer = await UserModel.create({
      email: 'buyer@example.com',
      accountType: AccountType.Buyer,
      walletAddress: randomEvmAddress(),
    } as User);
    const supplier = await UserModel.create({
      email: 'supplier@example.com',
      accountType: AccountType.Supplier,
      walletAddress: randomEvmAddress(),
    } as User);

    // login buyer and supplier
    const buyerToken = await app.login(buyer);
    const supplierToken = await app.login(supplier);

    // create deal
    const dealReq = await app
      .request()
      .post('/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send(
        generateDealDto({
          buyersEmails: [buyer.email],
          suppliersEmails: [supplier.email],
        }),
      );

    expect(dealReq.body).toHaveProperty('id');

    await app.request().get(`/deals/${dealReq.body.id}`).expect(401);

    const getDealRequest = await app
      .request()
      .get(`/deals/${dealReq.body.id}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(getDealRequest.body).toMatchObject({
      id: dealReq.body.id,
      buyers: [{ email: buyer.email, id: buyer.id }],
      suppliers: [{ email: supplier.email, id: supplier.id }],
      status: DealStatus.Proposal,
    } as Deal);

    // accept deal with supplier account
    const acceptDealReq = await app
      .request()
      .put(`/deals/${dealReq.body.id}`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ confirm: true })
      .expect(200);

    // check deal status
    expect(acceptDealReq.body).toMatchObject({
      id: dealReq.body.id,
      status: DealStatus.Confirmed,
    });

    // check deal updates are locked
    await app
      .request()
      .put(`/deals/${dealReq.body.id}`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ name: 'test 2' })
      .expect(400);
  });

  it('supplier creates deal proposal, buyer changes deal details, supplier accepts buyer changes', async () => {
    // create buyer and supplier users
    const buyer = await UserModel.create({
      email: 'buyer@example.com',
      accountType: AccountType.Buyer,
      walletAddress: randomEvmAddress(),
    } as User);
    const supplier = await UserModel.create({
      email: 'supplier@example.com',
      accountType: AccountType.Supplier,
      walletAddress: randomEvmAddress(),
    } as User);

    // login buyer and supplier
    const buyerToken = await app.login(buyer);
    const supplierToken = await app.login(supplier);

    // create deal
    const dealReq = await app
      .request()
      .post('/deals')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(
        generateDealDto({
          buyersEmails: [buyer.email],
          suppliersEmails: [supplier.email],
        }),
      );

    expect(dealReq.body).toHaveProperty('id');

    await app.request().get(`/deals/${dealReq.body.id}`).expect(401);

    const getDealRequest = await app
      .request()
      .get(`/deals/${dealReq.body.id}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(getDealRequest.body).toMatchObject({
      id: dealReq.body.id,
      buyers: [{ email: buyer.email, id: buyer.id }],
      suppliers: [{ email: supplier.email, id: supplier.id }],
      status: DealStatus.Proposal,
    } as Deal);

    // change deal with buyer account
    const changeDealReq = await app
      .request()
      .put(`/deals/${dealReq.body.id}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ name: 'test 2' })
      .expect(200);

    // check deal status
    expect(changeDealReq.body).toMatchObject({
      id: dealReq.body.id,
      status: DealStatus.Proposal,
      buyers: [{ email: buyer.email, id: buyer.id, approved: true }],
      suppliers: [{ email: supplier.email, id: supplier.id, approved: false }],
    });

    // accept deal with supplier account
    const acceptDealReq = await app
      .request()
      .put(`/deals/${dealReq.body.id}`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ confirm: true })
      .expect(200);

    // check deal status
    expect(acceptDealReq.body).toMatchObject({
      id: dealReq.body.id,
      status: DealStatus.Confirmed,
      buyers: [{ email: buyer.email, id: buyer.id, approved: true }],
      suppliers: [{ email: supplier.email, id: supplier.id, approved: true }],
    });

    // check deal updates are locked
    await app
      .request()
      .put(`/deals/${dealReq.body.id}`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ name: 'test 2' })
      .expect(400);
  });

  it('supplier creates deal proposal with a buyer email that does not exist in database, buyer signsup, deal is associated to the buyer', async () => {
    // create supplier users
    const buyerEmail = 'buyer@example.com';
    const supplier = await UserModel.create({
      email: 'supplier@example.com',
      accountType: AccountType.Supplier,
      walletAddress: randomEvmAddress(),
    } as User);

    // login supplier
    const supplierToken = await app.login(supplier);

    // create deal
    const dealReq = await app
      .request()
      .post('/deals')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(
        generateDealDto({
          buyersEmails: [buyerEmail],
          suppliersEmails: [supplier.email],
        }),
      );

    expect(dealReq.body).toHaveProperty('id');
    expect(dealReq.body.suppliers[0].id).toEqual(supplier.id);

    // signup buyer
    const buyerSignupReq = await app
      .request()
      .post('/auth/signup')
      .send({
        web3authToken: `{"payload":{"wallets":[{"address":"${randomEvmAddress()}","type":"evm"}]}}`,
        auth0Token: `{"payload":{"email":"${buyerEmail}"}}`,
        accountType: AccountType.Buyer,
      })
      .expect(201);

    const buyerToken = buyerSignupReq.body;

    expect(buyerToken).toHaveProperty('token');

    const buyer = await UserModel.findOne({ email: buyerEmail });
    expect(buyer).toBeTruthy();

    // check deal has buyer id
    const getDealReq = await app
      .request()
      .get(`/deals/${dealReq.body.id}`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .expect(200);

    // check deal status
    expect(getDealReq.body.buyers[0].id).toEqual(buyer.id);
    expect(getDealReq.body.suppliers[0].id).toEqual(supplier.id);
  });
});
