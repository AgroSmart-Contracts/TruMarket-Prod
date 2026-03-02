import { Deal, DealStatus } from '@/deals/deals.entities';
import { CreateDealDto } from '@/deals/dto/createDeal.dto';
import UserModel from '@/infra/database/users.model';
import { AccountType, User } from '@/users/users.entities';

import { randomEvmAddress, TestApp } from './utils';

describe('Create Deal (e2e)', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
  });

  afterEach(async () => {
    await app.teardown();
  });

  it('should throw error if required fields are not sent', async () => {
    // create buyer and supplier users
    const buyer = await UserModel.create({
      email: 'buyer@example.com',
      accountType: AccountType.Buyer,
      walletAddress: randomEvmAddress(),
    } as User);

    // login buyer and supplier
    const buyerToken = await app.login(buyer);

    // create deal
    await app
      .request()
      .post('/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({})
      .expect(400);

    // milestones must be 7
    const invalidNumberOfMilestonesReq = await app
      .request()
      .post('/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Test Deal',
        offerUnitPrice: 100,
        quantity: 10,
        proposalSupplierEmail: 'supplier@example.com',
        // maybe need to be removed
        roi: 100,
        netBalance: 100,
        revenue: 100,
        investmentAmount: 100,
        expectedShippingEndDate: new Date('2023-09-01T00:00:00.000Z'),
        shippingStartDate: new Date('2023-09-01T00:00:00.000Z'),
        destination: `Porto Alegre, Brazil`,
        portOfDestination: 'Porto Alegre',
        origin: `Lima, Peru`,
        portOfOrigin: 'Lima',
        transport: 'ship',
        contractId: 1,
        milestones: [],
        buyerCompany: {
          name: 'Buyer Company',
          country: 'Brazil',
          taxId: '123456',
        },
        supplierCompany: {
          name: 'Supplier Company',
          country: 'Peru',
          taxId: '654321',
        },
        buyersEmails: [],
        suppliersEmails: [],
      } as CreateDealDto)
      .expect(400);

    expect(invalidNumberOfMilestonesReq.body.message).toEqual([
      'Milestones array must have at least 7 elements',
      'buyersEmails must have at least one element',
      'suppliersEmails must have at least one element',
    ]);

    const invalidMilestonesFundsDistributionReq = await app
      .request()
      .post('/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Test Deal',
        offerUnitPrice: 100,
        quantity: 10,
        proposalSupplierEmail: 'supplier@example.com',
        // maybe need to be removed
        roi: 100,
        netBalance: 100,
        revenue: 100,
        investmentAmount: 100,
        expectedShippingEndDate: new Date('2023-09-01T00:00:00.000Z'),
        shippingStartDate: new Date('2023-09-01T00:00:00.000Z'),
        destination: `Porto Alegre, Brazil`,
        origin: `Lima, Peru`,
        portOfDestination: 'Porto Alegre',
        portOfOrigin: 'Lima',
        transport: 'ship',
        contractId: 1,
        milestones: [
          {
            description: 'Milestone 1',
            fundsDistribution: 20,
          },
          {
            description: 'Milestone 2',
            fundsDistribution: 50,
          },
          {
            description: 'Milestone 3',
            fundsDistribution: 0,
          },
          {
            description: 'Milestone 4',
            fundsDistribution: 0,
          },
          {
            description: 'Milestone 5',
            fundsDistribution: 0,
          },
          {
            description: 'Milestone 6',
            fundsDistribution: 0,
          },
          {
            description: 'Milestone 7',
            fundsDistribution: 20,
          },
        ],
        buyerCompany: {
          name: 'Buyer Company',
          country: 'Brazil',
          taxId: '123456',
        },
        supplierCompany: {
          name: 'Supplier Company',
          country: 'Peru',
          taxId: '654321',
        },
        buyersEmails: ['buyer@mail.com'],
        suppliersEmails: ['supplier@mail.com'],
      } as CreateDealDto)
      .expect(409);

    expect(invalidMilestonesFundsDistributionReq.body.message).toEqual(
      'Sum of all milestones fundsDistribution must be 100',
    );
  });

  it('should be possible to create deal if all required fields are sent', async () => {
    // create buyer and supplier users
    const buyer = await UserModel.create({
      email: 'buyer@example.com',
      accountType: AccountType.Buyer,
      walletAddress: randomEvmAddress(),
    } as User);

    // login buyer and supplier
    const buyerToken = await app.login(buyer);

    // create deal
    const dealReq = await app
      .request()
      .post('/deals')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Test Deal',
        offerUnitPrice: 100,
        quantity: 10,
        proposalSupplierEmail: 'supplier@example.com',
        // maybe need to be removed
        roi: 100,
        netBalance: 100,
        revenue: 100,
        investmentAmount: 100,
        expectedShippingEndDate: new Date('2023-09-01T00:00:00.000Z'),
        shippingStartDate: new Date('2023-09-01T00:00:00.000Z'),
        destination: `Porto Alegre, Brazil`,
        origin: `Lima, Peru`,
        portOfDestination: 'Porto Alegre',
        portOfOrigin: 'Lima',
        transport: 'ship',
        contractId: 1,
        milestones: [
          {
            description: 'Milestone 1',
            fundsDistribution: 20,
          },
          {
            description: 'Milestone 2',
            fundsDistribution: 50,
          },
          {
            description: 'Milestone 3',
            fundsDistribution: 0,
          },
          {
            description: 'Milestone 4',
            fundsDistribution: 0,
          },
          {
            description: 'Milestone 5',
            fundsDistribution: 0,
          },
          {
            description: 'Milestone 6',
            fundsDistribution: 0,
          },
          {
            description: 'Milestone 7',
            fundsDistribution: 30,
          },
        ],
        buyerCompany: {
          name: 'Buyer Company',
          country: 'Brazil',
          taxId: '123456',
        },
        supplierCompany: {
          name: 'Supplier Company',
          country: 'Peru',
          taxId: '654321',
        },
        buyersEmails: ['buyer@example.com'],
        suppliersEmails: ['supplier@example.com'],
      } as CreateDealDto)
      .expect(201);

    expect(dealReq.body).toHaveProperty('id');

    await app.request().get(`/deals/${dealReq.body.id}`).expect(401);

    const getDealRequest = await app
      .request()
      .get(`/deals/${dealReq.body.id}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(getDealRequest.body).toMatchObject({
      id: dealReq.body.id,
      name: 'Test Deal',
      offerUnitPrice: 100,
      quantity: 10,
      totalValue: 1000,
      // maybe need to be removed
      roi: 100,
      netBalance: 100,
      revenue: 100,
      investmentAmount: 100,
      expectedShippingEndDate: '2023-09-01T00:00:00.000Z' as any,
      shippingStartDate: '2023-09-01T00:00:00.000Z' as any,
      destination: `Porto Alegre, Brazil`,
      origin: `Lima, Peru`,
      contractId: 1,
      milestones: [
        {
          description: 'Milestone 1',
          fundsDistribution: 20,
        },
        {
          description: 'Milestone 2',
          fundsDistribution: 50,
        },
        {
          description: 'Milestone 3',
          fundsDistribution: 0,
        },
        {
          description: 'Milestone 4',
          fundsDistribution: 0,
        },
        {
          description: 'Milestone 5',
          fundsDistribution: 0,
        },
        {
          description: 'Milestone 6',
          fundsDistribution: 0,
        },
        {
          description: 'Milestone 7',
          fundsDistribution: 30,
        },
      ],
      status: DealStatus.Proposal,
      buyerCompany: {
        name: 'Buyer Company',
        country: 'Brazil',
        taxId: '123456',
      },
      supplierCompany: {
        name: 'Supplier Company',
        country: 'Peru',
        taxId: '654321',
      },
      buyers: [
        {
          id: buyer.id,
          email: buyer.email,
        },
      ],
      suppliers: [
        {
          email: 'supplier@example.com',
        },
      ],
    } as Deal);
  });
});
