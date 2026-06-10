import {
  BankAccountOwnerType,
  BankAccountProvider,
  BankAccountStatus,
} from './bank-accounts.entities';
import { BankAccountsService } from './bank-accounts.service';

describe('BankAccountsService', () => {
  const makeService = () => {
    const bankAccounts = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateById: jest.fn(),
    } as any;

    const osnService = {
      listOrganizationBanks: jest.fn(),
      createOrganizationBankAccount: jest.fn(),
    } as any;

    const osnRuntimeSettings = {
      getOsnRuntimeSettings: jest.fn(),
    } as any;

    const users = {
      findById: jest.fn(),
    } as any;

    const notificationsService = {
      sendBankAccountApprovedBuyerInApp: jest.fn(),
      sendBankAccountApprovedBuyerEmail: jest.fn(),
    } as any;

    const service = new BankAccountsService(
      bankAccounts,
      users,
      osnService,
      osnRuntimeSettings,
      notificationsService,
    );

    return {
      service,
      bankAccounts,
      osnService,
      osnRuntimeSettings,
      users,
      notificationsService,
    };
  };

  it('syncOsnOrganizationBanks transitions pending buyer account to ACTIVE when OSN is active', async () => {
    const {
      service,
      bankAccounts,
      osnService,
      osnRuntimeSettings,
      users,
      notificationsService,
    } = makeService();

    osnRuntimeSettings.getOsnRuntimeSettings.mockResolvedValue({
      organizationId: 'org_1',
    });
    osnService.listOrganizationBanks.mockResolvedValue([
      {
        id: 'osn_bank_1',
        is_active: true,
      },
    ]);
    bankAccounts.update.mockResolvedValue(1);
    users.findById.mockResolvedValue({ id: 'u1', email: 'buyer@example.com' });
    bankAccounts.findById.mockResolvedValue({
      id: 'ba_1',
      userId: 'u1',
      bankName: 'Test Bank',
      currencyCode: 'USD',
      accountLast4: '1234',
    });
    bankAccounts.find
      .mockResolvedValueOnce([
        {
          id: 'ba_1',
          userId: 'u1',
          provider: BankAccountProvider.OSN,
          accountType: BankAccountOwnerType.Buyer,
          providerAccountId: 'osn_bank_1',
          providerOrganizationId: 'org_1',
          status: BankAccountStatus.PENDING_APPROVAL,
          isActive: false,
          archived: false,
          providerPayload: { request: {} },
        },
      ])
      .mockResolvedValue([]);

    const result = await service.syncOsnOrganizationBanks({
      pendingOnly: true,
    });

    expect(result.checked).toBe(1);
    expect(result.errors).toBe(0);
    expect(result.updated).toBe(1);
    expect(result.transitions).toBe(1);
    expect(osnService.listOrganizationBanks).toHaveBeenCalledWith({
      organizationId: 'org_1',
    });
    expect(bankAccounts.update).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'ba_1',
        status: BankAccountStatus.PENDING_APPROVAL,
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: BankAccountStatus.ACTIVE,
          isActive: true,
          syncError: undefined,
        }),
      }),
    );
    expect(
      notificationsService.sendBankAccountApprovedBuyerInApp,
    ).toHaveBeenCalledTimes(1);
    expect(
      notificationsService.sendBankAccountApprovedBuyerEmail,
    ).toHaveBeenCalledTimes(1);
  });

  it('listForUser triggers sync-on-read for stale pending buyer accounts', async () => {
    const { service, bankAccounts } = makeService();
    const syncSpy = jest
      .spyOn(service, 'syncOsnOrganizationBanks')
      .mockResolvedValue({ updated: 0, checked: 0, errors: 0, transitions: 0 });

    bankAccounts.findOne.mockResolvedValue({
      id: 'ba_pending',
      status: BankAccountStatus.PENDING_APPROVAL,
      lastSyncedAt: new Date(Date.now() - 120_000),
    });
    bankAccounts.find.mockResolvedValue([]);

    await service.listForUser({ id: 'buyer_1', accountType: 'buyer' } as any);

    expect(syncSpy).toHaveBeenCalledWith({
      userId: 'buyer_1',
      pendingOnly: true,
    });
  });

  it('listForUser does not sync-on-read for supplier users', async () => {
    const { service, bankAccounts } = makeService();
    const syncSpy = jest.spyOn(service, 'syncOsnOrganizationBanks');
    bankAccounts.find.mockResolvedValue([]);

    await service.listForUser({ id: 'sup_1', accountType: 'supplier' } as any);

    expect(syncSpy).not.toHaveBeenCalled();
  });

  it('does not send duplicate approval notifications when transition update is no-op', async () => {
    const {
      service,
      bankAccounts,
      osnService,
      osnRuntimeSettings,
      users,
      notificationsService,
    } = makeService();

    osnRuntimeSettings.getOsnRuntimeSettings.mockResolvedValue({
      organizationId: 'org_1',
    });
    bankAccounts.find
      .mockResolvedValueOnce([
        {
          id: 'ba_1',
          userId: 'u1',
          provider: BankAccountProvider.OSN,
          accountType: BankAccountOwnerType.Buyer,
          providerAccountId: 'osn_bank_1',
          providerOrganizationId: 'org_1',
          status: BankAccountStatus.PENDING_APPROVAL,
          isActive: false,
          archived: false,
          providerPayload: {},
        },
      ])
      .mockResolvedValue([]);
    osnService.listOrganizationBanks.mockResolvedValue([
      { id: 'osn_bank_1', is_active: true },
    ]);

    // Simulate race: account already transitioned by another worker.
    bankAccounts.update.mockResolvedValue(0);
    bankAccounts.updateById.mockResolvedValue(null);
    users.findById.mockResolvedValue({ id: 'u1', email: 'buyer@example.com' });

    const result = await service.syncOsnOrganizationBanks({
      pendingOnly: true,
    });

    expect(result.transitions).toBe(0);
    expect(
      notificationsService.sendBankAccountApprovedBuyerInApp,
    ).not.toHaveBeenCalled();
    expect(
      notificationsService.sendBankAccountApprovedBuyerEmail,
    ).not.toHaveBeenCalled();
  });

  it('keeps account pending while updating latestResponse and lastSyncedAt', async () => {
    const { service, bankAccounts, osnService } = makeService();

    bankAccounts.find
      .mockResolvedValueOnce([
        {
          id: 'ba_1',
          userId: 'u1',
          provider: BankAccountProvider.OSN,
          accountType: BankAccountOwnerType.Buyer,
          providerAccountId: 'osn_bank_1',
          providerOrganizationId: 'org_1',
          status: BankAccountStatus.PENDING_APPROVAL,
          isActive: false,
          archived: false,
          providerPayload: {},
        },
      ])
      .mockResolvedValue([]);
    osnService.listOrganizationBanks.mockResolvedValue([
      { id: 'osn_bank_1', organization_id: 'org_1', is_active: false },
    ]);
    bankAccounts.update.mockResolvedValue(0);
    bankAccounts.updateById.mockResolvedValue({ id: 'ba_1' });

    const result = await service.syncOsnOrganizationBanks({
      pendingOnly: true,
    });

    expect(result.checked).toBe(1);
    expect(result.transitions).toBe(0);
    expect(result.errors).toBe(0);
    expect(bankAccounts.updateById).toHaveBeenCalledWith(
      'ba_1',
      expect.objectContaining({
        status: BankAccountStatus.PENDING_APPROVAL,
        isActive: false,
        lastSyncedAt: expect.any(Date),
        providerPayload: expect.objectContaining({
          latestResponse: expect.objectContaining({
            id: 'osn_bank_1',
            is_active: false,
          }),
        }),
      }),
    );
  });

  it('groups by providerOrganizationId and syncs each organization separately', async () => {
    const { service, bankAccounts, osnService } = makeService();

    bankAccounts.find
      .mockResolvedValueOnce([
        {
          id: 'ba_1',
          userId: 'u1',
          provider: BankAccountProvider.OSN,
          accountType: BankAccountOwnerType.Buyer,
          providerAccountId: 'osn_bank_1',
          providerOrganizationId: 'org_1',
          status: BankAccountStatus.PENDING_APPROVAL,
          isActive: false,
          archived: false,
          providerPayload: {},
        },
        {
          id: 'ba_2',
          userId: 'u2',
          provider: BankAccountProvider.OSN,
          accountType: BankAccountOwnerType.Buyer,
          providerAccountId: 'osn_bank_2',
          providerOrganizationId: 'org_2',
          status: BankAccountStatus.PENDING_APPROVAL,
          isActive: false,
          archived: false,
          providerPayload: {},
        },
      ])
      .mockResolvedValue([]);
    osnService.listOrganizationBanks
      .mockResolvedValueOnce([
        { id: 'osn_bank_1', organization_id: 'org_1', is_active: false },
      ])
      .mockResolvedValueOnce([
        { id: 'osn_bank_2', organization_id: 'org_2', is_active: false },
      ]);
    bankAccounts.update.mockResolvedValue(0);
    bankAccounts.updateById.mockResolvedValue({ id: 'x' });

    const result = await service.syncOsnOrganizationBanks({
      pendingOnly: true,
    });

    expect(result.checked).toBe(2);
    expect(osnService.listOrganizationBanks).toHaveBeenCalledTimes(2);
    expect(osnService.listOrganizationBanks).toHaveBeenNthCalledWith(1, {
      organizationId: 'org_1',
    });
    expect(osnService.listOrganizationBanks).toHaveBeenNthCalledWith(2, {
      organizationId: 'org_2',
    });
  });

  it('uses runtime fallback org only for rows missing providerOrganizationId', async () => {
    const { service, bankAccounts, osnService, osnRuntimeSettings } =
      makeService();

    osnRuntimeSettings.getOsnRuntimeSettings.mockResolvedValue({
      organizationId: 'org_fallback',
    });
    bankAccounts.find
      .mockResolvedValueOnce([
        {
          id: 'ba_1',
          userId: 'u1',
          provider: BankAccountProvider.OSN,
          accountType: BankAccountOwnerType.Buyer,
          providerAccountId: 'osn_bank_1',
          providerOrganizationId: undefined,
          status: BankAccountStatus.PENDING_APPROVAL,
          isActive: false,
          archived: false,
          providerPayload: {},
        },
      ])
      .mockResolvedValue([]);
    osnService.listOrganizationBanks.mockResolvedValue([
      { id: 'osn_bank_1', organization_id: 'org_fallback', is_active: false },
    ]);
    bankAccounts.update.mockResolvedValue(0);
    bankAccounts.updateById.mockResolvedValue({ id: 'ba_1' });

    await service.syncOsnOrganizationBanks({ pendingOnly: true });

    expect(osnRuntimeSettings.getOsnRuntimeSettings).toHaveBeenCalledTimes(1);
    expect(osnService.listOrganizationBanks).toHaveBeenCalledWith({
      organizationId: 'org_fallback',
    });
    expect(bankAccounts.updateById).toHaveBeenCalledWith(
      'ba_1',
      expect.objectContaining({
        providerOrganizationId: 'org_fallback',
      }),
    );
  });

  it('does not block known-org rows when runtime fallback resolution fails', async () => {
    const { service, bankAccounts, osnService, osnRuntimeSettings } =
      makeService();

    osnRuntimeSettings.getOsnRuntimeSettings.mockRejectedValue(
      new Error('runtime unavailable'),
    );
    bankAccounts.find
      .mockResolvedValueOnce([
        {
          id: 'ba_known',
          userId: 'u1',
          provider: BankAccountProvider.OSN,
          accountType: BankAccountOwnerType.Buyer,
          providerAccountId: 'osn_bank_known',
          providerOrganizationId: 'org_1',
          status: BankAccountStatus.PENDING_APPROVAL,
          isActive: false,
          archived: false,
          providerPayload: {},
        },
        {
          id: 'ba_missing',
          userId: 'u2',
          provider: BankAccountProvider.OSN,
          accountType: BankAccountOwnerType.Buyer,
          providerAccountId: 'osn_bank_missing_org',
          providerOrganizationId: undefined,
          status: BankAccountStatus.PENDING_APPROVAL,
          isActive: false,
          archived: false,
          providerPayload: {},
        },
      ])
      .mockResolvedValue([]);
    osnService.listOrganizationBanks.mockResolvedValue([
      { id: 'osn_bank_known', organization_id: 'org_1', is_active: false },
    ]);
    bankAccounts.update.mockResolvedValue(0);
    bankAccounts.updateById.mockResolvedValue({ id: 'x' });

    const result = await service.syncOsnOrganizationBanks({
      pendingOnly: true,
    });

    expect(osnService.listOrganizationBanks).toHaveBeenCalledTimes(1);
    expect(osnService.listOrganizationBanks).toHaveBeenCalledWith({
      organizationId: 'org_1',
    });
    expect(result.checked).toBe(2);
    expect(result.errors).toBe(1);
    expect(bankAccounts.updateById).toHaveBeenCalledWith(
      'ba_missing',
      expect.objectContaining({
        syncError: expect.stringContaining('Missing providerOrganizationId'),
      }),
    );
  });
});
