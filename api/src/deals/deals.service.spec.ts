import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';

import { BlockchainService } from '@/blockchain/blockchain.service';
import { providers } from '@/constants';
import { NotificationsService } from '@/notifications/notifications.service';
import { SubscriptionsService } from '@/notifications/subscriptions.service';
import { AccountType, User } from '@/users/users.entities';
import { UsersService } from '@/users/users.service';

import { Deal, DealStatus } from './deals.entities';
import { DealsRepository } from './deals.repository';
import { DealsService, ListDealsQuery } from './deals.service';

describe('DealsService', () => {
  let dealsService: DealsService;
  let dealsRepository: DealsRepository;
  let notificationsService: NotificationsService;
  let blockchainService: BlockchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        UsersService,
        {
          provide: providers.NotificationsRepository,
          useValue: {
            bulkCreateByRecipent: jest.fn(),
          },
        },
        {
          provide: providers.DealsRepository,
          useValue: {
            create: jest.fn(),
            findByUser: jest.fn(),
            findById: jest.fn(),
            updateById: jest.fn(),
          },
        },
        {
          provide: providers.UsersRepository,
          useValue: {
            findById: jest.fn(),
            updateById: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendInviteToSignupNotification: jest.fn(),
            sendNewProposalNotification: jest.fn(),
            sendMilestoneApprovedNotification: jest.fn(),
          },
        },
        NotificationsService,
        SubscriptionsService,
        BlockchainService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: 'DealsManager',
          useValue: {
            write: {
              proceed: jest.fn(),
            },
          },
        },
        {
          provide: 'PublicClient',
          useValue: {
            getTransactionReceipt: jest.fn(),
          },
        },
      ],
    }).compile();

    dealsRepository = module.get<DealsRepository>(providers.DealsRepository);
    dealsService = module.get<DealsService>(DealsService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  describe('createDeal', () => {
    it('should create a new deal and send signup email to supplier if he does not exist in the database', async () => {
      const user: User = {
        id: 'user1',
        accountType: AccountType.Buyer,
        email: 'buyer@example.com',
      } as User;

      const dealPayload: Partial<Deal> = {
        name: 'New Deal',
        description: 'This is a new deal',
        investmentAmount: 100,
        buyers: [{ email: 'buyer@example.com' }],
        suppliers: [{ email: 'supplier@mail.com' }],
      };

      const createdDeal: Deal = {
        name: 'New Deal',
        buyers: [
          {
            email: 'buyer@example.com',
            new: true,
          },
        ],
        suppliers: [
          {
            email: 'supplier@example.com',
            new: true,
          },
        ],
        description: 'This is a new deal',
        investmentAmount: 100,
      } as Deal;

      jest
        .spyOn(notificationsService, 'sendInviteToSignupNotification')
        .mockResolvedValue(undefined);
      jest
        .spyOn(dealsRepository, 'create')
        .mockResolvedValue(createdDeal as Deal);
      jest
        .spyOn(notificationsService, 'sendNewProposalNotification')
        .mockResolvedValue(undefined);

      const result = await dealsService.createDeal(user, dealPayload);

      expect(dealsRepository.create).toHaveBeenCalledWith({
        description: 'This is a new deal',
        investmentAmount: 100,
        name: 'New Deal',
        buyers: [{ email: 'buyer@example.com', new: true }],
        suppliers: [{ email: 'supplier@mail.com', new: true }],
        status: DealStatus.Proposal,
      });
      expect(
        notificationsService.sendNewProposalNotification,
      ).toHaveBeenCalledWith(
        dealsService.selectParticipantsEmailsBasedOnUser(user, createdDeal),
        createdDeal,
        user.email,
      );
      expect(result).toEqual(createdDeal);
    });

    it('should create a new deal and send signup email to buyer if he does not exist in the database', async () => {
      const user: User = {
        id: 'user1',
        accountType: AccountType.Supplier,
        email: 'supplier@example.com',
      } as User;

      const dealPayload: Partial<Deal> = {
        name: 'New Deal',
        description: 'This is a new deal',
        investmentAmount: 100,
        buyers: [{ email: 'buyer@example.com' }],
        suppliers: [{ email: 'supplier@example.com' }],
      };

      const createdDeal: Deal = {
        name: 'New Deal',
        buyers: [{ email: user.email }],
        suppliers: [{ email: 'supplier@example.com' }],
        description: 'This is a new deal',
        investmentAmount: 100,
      } as Deal;

      jest
        .spyOn(notificationsService, 'sendInviteToSignupNotification')
        .mockResolvedValue(undefined);
      jest
        .spyOn(dealsRepository, 'create')
        .mockResolvedValue(createdDeal as Deal);
      jest
        .spyOn(notificationsService, 'sendNewProposalNotification')
        .mockResolvedValue(undefined);

      const result = await dealsService.createDeal(user, dealPayload);

      expect(dealsRepository.create).toHaveBeenCalledWith({
        description: 'This is a new deal',
        investmentAmount: 100,
        name: 'New Deal',
        buyers: [{ email: 'buyer@example.com', new: true }],
        suppliers: [{ email: 'supplier@example.com', new: true }],
        status: DealStatus.Proposal,
      });
      expect(
        notificationsService.sendNewProposalNotification,
      ).toHaveBeenCalledWith(
        dealsService.selectParticipantsEmailsBasedOnUser(user, createdDeal),
        createdDeal,
        user.email,
      );
      expect(result).toEqual(createdDeal);
    });

    it('should create a new deal and associate supplier details', async () => {
      const user: User = {
        id: 'user1',
        accountType: AccountType.Buyer,
        email: 'buyer@example.com',
      } as User;

      const dealPayload: Partial<Deal> = {
        name: 'New Deal',
        description: 'This is a new deal',
        investmentAmount: 100,
        suppliers: [{ email: 'supplier@mail.com' }],
        buyers: [{ email: user.email }],
      };

      const createdDeal: Deal = {
        name: 'New Deal',
        buyers: [{ email: user.email }],
        suppliers: [{ email: 'supplier@mail.com', new: true }],
        description: 'This is a new deal',
        investmentAmount: 100,
      } as Deal;

      jest
        .spyOn(notificationsService, 'sendInviteToSignupNotification')
        .mockResolvedValue(undefined);
      jest
        .spyOn(dealsRepository, 'create')
        .mockResolvedValue(createdDeal as Deal);
      jest
        .spyOn(notificationsService, 'sendNewProposalNotification')
        .mockResolvedValue(undefined);

      const result = await dealsService.createDeal(user, dealPayload);

      expect(dealsRepository.create).toHaveBeenCalledWith({
        description: 'This is a new deal',
        investmentAmount: 100,
        name: 'New Deal',
        status: DealStatus.Proposal,
        buyers: [{ email: user.email, new: true }],
        suppliers: [{ email: 'supplier@mail.com', new: true }],
      });
      expect(
        notificationsService.sendNewProposalNotification,
      ).toHaveBeenCalledWith(
        dealsService.selectParticipantsEmailsBasedOnUser(user, createdDeal),
        createdDeal,
        user.email,
      );
      expect(result).toEqual(createdDeal);
    });

    it('should create a new deal and associate buyer details', async () => {
      const user: User = {
        id: 'user1',
        accountType: AccountType.Supplier,
        email: 'supplier@example.com',
      } as User;

      const dealPayload: Partial<Deal> = {
        name: 'New Deal',
        description: 'This is a new deal',
        investmentAmount: 100,
        buyers: [{ email: 'buyer@example.com' }],
        suppliers: [{ email: 'supplier@example.com' }],
      };

      const createdDeal: Deal = {
        name: 'New Deal',
        buyers: [{ email: user.email, new: true }],
        suppliers: [{ email: user.email, new: true }],
        description: 'This is a new deal',
        investmentAmount: 100,
      } as Deal;

      jest
        .spyOn(notificationsService, 'sendInviteToSignupNotification')
        .mockResolvedValue(undefined);
      jest
        .spyOn(dealsRepository, 'create')
        .mockResolvedValue(createdDeal as Deal);
      jest
        .spyOn(notificationsService, 'sendNewProposalNotification')
        .mockResolvedValue(undefined);

      const result = await dealsService.createDeal(user, dealPayload);

      expect(dealsRepository.create).toHaveBeenCalledWith({
        description: 'This is a new deal',
        investmentAmount: 100,
        name: 'New Deal',
        buyers: [{ email: 'buyer@example.com', new: true }],
        suppliers: [{ email: 'supplier@example.com', new: true }],
        status: DealStatus.Proposal,
      });
      expect(
        notificationsService.sendNewProposalNotification,
      ).toHaveBeenCalledWith(
        dealsService.selectParticipantsEmailsBasedOnUser(user, createdDeal),
        createdDeal,
        user.email,
      );
      expect(result).toEqual(createdDeal);
    });
  });

  describe('listDeals', () => {
    it('should return a list of deals', async () => {
      const userId = 'user1';
      const query: ListDealsQuery = {
        status: DealStatus.Proposal,
      };

      const expectedDeals: Deal[] = [
        {
          id: 'deal1',
          name: 'Deal 1',
          status: DealStatus.Proposal,
        } as Deal,
        {
          id: 'deal2',
          name: 'Deal 2',
          status: DealStatus.Proposal,
        } as Deal,
      ];

      jest
        .spyOn(dealsRepository, 'findByUser')
        .mockResolvedValue(expectedDeals as Deal[]);

      const result = await dealsService.findDealsByUser(userId, query);

      expect(dealsRepository.findByUser).toHaveBeenCalledWith(userId, query);
      expect(result).toEqual(expectedDeals);
    });
  });

  describe('updateCurrentMilestone', () => {
    it('should throw an error if deal is not found', async () => {
      const dealId = 'deal1';
      const currentMilestone = 1;
      const signature = 'validSignature';
      const user: User = {
        id: 'user1',
        accountType: AccountType.Buyer,
        email: 'buyer@example.com',
        walletAddress: '0x1234567890abcdef',
      } as User;

      jest.spyOn(dealsRepository, 'findById').mockResolvedValue(null);

      await expect(
        dealsService.updateCurrentMilestone(
          dealId,
          currentMilestone,
          signature,
          user,
        ),
      ).rejects.toThrow('Deal not found');
      expect(dealsRepository.findById).toHaveBeenCalledWith(dealId);
    });

    it('should throw an error if signature is invalid', async () => {
      const dealId = 'deal1';
      const currentMilestone = 1;
      const signature = 'invalidSignature';
      const user: User = {
        id: 'user1',
        accountType: AccountType.Buyer,
        email: 'buyer@example.com',
        walletAddress: '0x1234567890abcdef',
      } as User;

      const deal: any = {
        id: dealId,
        buyerId: user.id,
        nftID: 'nft1',
        milestones: ['Milestone 1', 'Milestone 2'],
        buyers: [{ id: user.id, email: user.email }],
        suppliers: [{ id: 'user-2', email: 'supplier@example.com' }],
        currentMilestone: 0,
      };

      jest.spyOn(dealsService, 'findById').mockResolvedValue(deal as Deal);
      jest.spyOn(blockchainService, 'verifyMessage').mockResolvedValue(false);

      await expect(
        dealsService.updateCurrentMilestone(
          dealId,
          currentMilestone,
          signature,
          user,
        ),
      ).rejects.toThrow('Invalid signature');
      expect(dealsService.findById).toHaveBeenCalledWith(dealId);
      expect(blockchainService.verifyMessage).toHaveBeenCalledWith(
        user.walletAddress as `0x${string}`,
        `Approve milestone ${currentMilestone} of deal ${deal.nftID}`,
        signature as `0x${string}`,
      );
    });

    it('should throw an error if user is not authorized to update the deal', async () => {
      const dealId = 'deal1';
      const currentMilestone = 1;
      const signature = 'validSignature';
      const user: User = {
        id: 'user1',
        accountType: AccountType.Supplier,
        email: 'supplier@example.com',
        walletAddress: '0x1234567890abcdef',
      } as User;

      const deal: any = {
        id: dealId,
        buyerId: 'otherUser',
        nftID: 'nft1',
        milestones: ['Milestone 1', 'Milestone 2'],
        buyers: [{ id: 'user-2', email: 'buyer@example.com' }],
        suppliers: [{ id: user.id, email: user.email }],
        currentMilestone: 0,
      };

      jest.spyOn(dealsService, 'findById').mockResolvedValue(deal as Deal);

      await expect(
        dealsService.updateCurrentMilestone(
          dealId,
          currentMilestone,
          signature,
          user,
        ),
      ).rejects.toThrow(
        'User not authorized to update the current milestone for this deal',
      );
      expect(dealsService.findById).toHaveBeenCalledWith(dealId);
    });

    // it('should update the current milestone for a deal', async () => {
    //   const dealId = 'deal1';
    //   const currentMilestone = 1;
    //   const signature = 'validSignature';
    //   const user: User = {
    //     id: 'user1',
    //     accountType: AccountType.Buyer,
    //     email: 'buyer@example.com',
    //     walletAddress: '0x1234567890abcdef',
    //   } as User;

    //   const deal: any = {
    //     id: dealId,
    //     buyerId: user.id,
    //     nftID: '1',
    //     milestones: ['Milestone 1', 'Milestone 2'],
    //     buyers: [{ id: user.id, email: user.email }],
    //     suppliers: [{ id: 'user-2', email: 'supplier@example.com' }],
    //     currentMilestone: 0,
    //   };

    //   jest.spyOn(dealsService, 'findById').mockResolvedValue(deal as Deal);
    //   jest.spyOn(blockchainService, 'verifyMessage').mockResolvedValue(true);
    //   jest
    //     .spyOn(notificationsService, 'sendMilestoneApprovedNotification')
    //     .mockResolvedValue(undefined);
    //   jest.spyOn(dealsRepository, 'updateById').mockResolvedValue(deal as Deal);

    //   const result = await dealsService.updateCurrentMilestone(
    //     dealId,
    //     currentMilestone,
    //     signature,
    //     user,
    //   );

    //   expect(dealsService.findById).toHaveBeenCalledWith(dealId);
    //   expect(blockchainService.verifyMessage).toHaveBeenCalledWith(
    //     user.walletAddress as `0x${string}`,
    //     `Approve milestone ${currentMilestone} of deal ${deal.nftID}`,
    //     signature as `0x${string}`,
    //   );
    //   expect(
    //     notificationsService.sendMilestoneApprovedNotification,
    //   ).toHaveBeenCalledWith(
    //     dealsService.selectParticipantsEmailsBasedOnUser(user, deal),
    //     deal,
    //     deal.milestones[currentMilestone],
    //     user.email,
    //   );
    //   expect(dealsRepository.updateById).toHaveBeenCalledWith(dealId, {
    //     currentMilestone: deal.currentMilestone + 1,
    //   });
    //   expect(result).toEqual(deal);
    // });

    // TODO: Uncomment this test after implementing the NFT minting
    // it('should throw an error if deal does not have an nftId associated', async () => {
    //   const dealId = 'deal1';
    //   const currentMilestone = 1;
    //   const signature = 'validSignature';
    //   const user: User = {
    //     id: 'user1',
    //     accountType: AccountType.Buyer,
    //     email: 'buyer@example.com',
    //     walletAddress: '0x1234567890abcdef',
    //   } as User;

    //   const deal: any = {
    //     id: dealId,
    //     buyerId: user.id,
    //     milestones: ['Milestone 1', 'Milestone 2'],
    //     currentMilestone: 0,
    //   };

    //   jest.spyOn(dealsService, 'findById').mockResolvedValue(deal as Deal);

    //   await expect(
    //     dealsService.updateCurrentMilestone(
    //       dealId,
    //       currentMilestone,
    //       signature,
    //       user,
    //     ),
    //   ).rejects.toThrow('Deal NFT must be minted first');
    //   expect(dealsService.findById).toHaveBeenCalledWith(dealId);
    // });

    it('should throw an error if the milestone to update is not the next one', async () => {
      const dealId = 'deal1';
      const currentMilestone = 2;
      const signature = 'validSignature';
      const user: User = {
        id: 'user1',
        accountType: AccountType.Buyer,
        email: 'buyer@example.com',
        walletAddress: '0x1234567890abcdef',
      } as User;

      const deal: any = {
        id: dealId,
        buyerId: user.id,
        nftID: 'nft1',
        milestones: ['Milestone 1', 'Milestone 2'],
        buyers: [{ id: user.id, email: user.email }],
        suppliers: [{ id: 'user-2', email: 'supplier@example.com' }],
        currentMilestone: 0,
      };

      jest.spyOn(dealsService, 'findById').mockResolvedValue(deal as Deal);

      await expect(
        dealsService.updateCurrentMilestone(
          dealId,
          currentMilestone,
          signature,
          user,
        ),
      ).rejects.toThrow(
        'Cannot update milestone. The next milestone to update is Milestone 1',
      );
      expect(dealsService.findById).toHaveBeenCalledWith(dealId);
    });
  });
});
