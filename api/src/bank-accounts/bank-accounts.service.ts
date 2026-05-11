import { Inject, Injectable } from '@nestjs/common';

import { providers } from '@/constants';
import { BadRequestError, ForbiddenError } from '@/errors';
import { NotificationsService } from '@/notifications/notifications.service';
import { OsnService } from '@/osn/osn.service';
import { OsnRuntimeSettingsService } from '@/settings/osn-runtime-settings.service';
import { User } from '@/users/users.entities';
import { UsersRepository } from '@/users/users.repository';
import { logger } from '@/logger';

import {
  BankAccount,
  BankAccountOwnerType,
  BankAccountProvider,
  BankAccountStatus,
} from './bank-accounts.entities';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccountsRepository } from './bank-accounts.repository';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

function last4(input: string): string {
  const digits = (input || '').replace(/\s+/g, '');
  return digits.slice(-4);
}

/**
 * Placeholder encryption for now. Replace with KMS / vault integration.
 */
function encryptSensitive(input: string): string {
  // NOTE: do not log this. This is a scaffold to unblock UI.
  return Buffer.from(input, 'utf8').toString('base64');
}

const READ_SYNC_STALE_MS = Number(
  process.env.BANK_ACCOUNTS_READ_SYNC_STALE_MS || 60_000,
);

@Injectable()
export class BankAccountsService {
  constructor(
    @Inject(providers.BankAccountsRepository)
    private readonly bankAccounts: BankAccountsRepository,
    @Inject(providers.UsersRepository)
    private readonly users: UsersRepository,
    private readonly osnService: OsnService,
    private readonly osnRuntimeSettings: OsnRuntimeSettingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listForUser(user: User): Promise<BankAccount[]> {
    await this.syncPendingBuyerAccountsForUserIfStale(user);
    return this.bankAccounts.find(
      { userId: user.id, archived: { $ne: true } } as any,
      undefined,
      { sort: { createdAt: -1 } } as any,
    );
  }

  async getForUser(user: User, id: string): Promise<BankAccount> {
    const account = await this.bankAccounts.findById(id);
    if (!account || account.archived) throw new BadRequestError('Bank account not found');
    if (account.userId !== user.id) throw new ForbiddenError('Not allowed');
    return account;
  }

  async createForUser(user: User, dto: CreateBankAccountDto): Promise<BankAccount> {
    if (dto.accountType !== (user.accountType as any)) {
      // enforce request matches authenticated user's role
      throw new BadRequestError('Invalid accountType for user');
    }

    const now = new Date();

    const isSupplierRequest = dto.accountType === BankAccountOwnerType.Supplier;

    // Suppliers have exactly one bank account in the UI and it is always usable by TruMarket.
    // We enforce this by archiving any existing non-archived supplier accounts and creating a new ACTIVE one.
    if (isSupplierRequest) {
      const existing = await this.bankAccounts.find(
        { userId: user.id, accountType: BankAccountOwnerType.Supplier, archived: { $ne: true } } as any,
      );

      if (existing.length > 0) {
        await this.bankAccounts.update(
          { userId: user.id, accountType: BankAccountOwnerType.Supplier, archived: { $ne: true } } as any,
          { $set: { archived: true, isDefault: false, updatedAt: now } } as any,
        );

        if (!dto.supersedesId) {
          // Best-effort: tie to the first superseded record
          dto.supersedesId = existing[0].id;
        }
      }
    }

    // OSN integration chosen pattern:
    // - For buyers: call OSN first (authoritative providerAccountId + is_active),
    //   then create the local DB record from OSN response.
    // - For suppliers: keep internal payouts-only bank accounts (no OSN call).
    if (!isSupplierRequest) {
      const runtimeSettings = await this.osnRuntimeSettings.getOsnRuntimeSettings();
      if (!runtimeSettings.organizationId) {
        throw new BadRequestError('OSN organizationId is not configured in admin settings or env');
      }

      const { request, response } =
        await this.osnService.createOrganizationBankAccount({
          organizationId: runtimeSettings.organizationId,
          bank: {
            currencyCode: dto.currencyCode,
            countryCode: dto.countryCode,
            bankName: dto.bankName,
            accountHolderName: dto.accountHolderName,
            accountNumberPlain: dto.accountNumber,
            swiftBic: dto.swiftBic,
            ibanPlain: dto.iban,
            routingNumber: dto.routingNumber,
            bankAddress: dto.bankAddress,
            accountHolderAddress: dto.accountHolderAddress,
          },
        });

      if (dto.supersedesId) {
        await this.bankAccounts.updateById(dto.supersedesId, {
          archived: true,
          isDefault: false,
          updatedAt: now,
        } as any);
      }

      const status = response.is_active ? BankAccountStatus.ACTIVE : BankAccountStatus.PENDING_APPROVAL;
      const isActive = response.is_active === true;

      const existingDefault = await this.bankAccounts.findOne(
        {
          userId: user.id,
          provider: BankAccountProvider.OSN,
          status: BankAccountStatus.ACTIVE,
          archived: { $ne: true },
          isDefault: true,
        } as any,
      );

      const isDefault = status === BankAccountStatus.ACTIVE ? !existingDefault : false;

      const created = await this.bankAccounts.create({
        userId: user.id,
        accountType: dto.accountType,
        provider: dto.provider || BankAccountProvider.OSN,
        providerAccountId: response.id,
        providerOrganizationId: response.organization_id,
        status,
        isActive,
        isDefault,
        archived: false,
        nickname: dto.nickname,
        supersedesId: dto.supersedesId,

        currencyCode: dto.currencyCode,
        countryCode: dto.countryCode,
        bankName: dto.bankName,
        accountHolderName: dto.accountHolderName,
        accountNumberEncrypted: encryptSensitive(dto.accountNumber),
        accountLast4: last4(dto.accountNumber),
        swiftBic: dto.swiftBic,
        ibanEncrypted: dto.iban ? encryptSensitive(dto.iban) : undefined,
        routingNumber: dto.routingNumber,
        bankAddress: dto.bankAddress,
        accountHolderAddress: dto.accountHolderAddress,

        providerPayload: { request, response },
        createdAt: now,
        updatedAt: now,
      } as Partial<BankAccount>);

      return created;
    }

    // Supplier flow: internal payouts-only bank accounts.
    const created = await this.bankAccounts.create({
      userId: user.id,
      accountType: dto.accountType,
      provider: dto.provider || BankAccountProvider.OSN,
      // providerAccountId is not an OSN id for suppliers; keep a unique placeholder.
      providerAccountId: `supplier_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      providerOrganizationId: undefined,
      status: BankAccountStatus.ACTIVE,
      isActive: true,
      isDefault: true,
      archived: false,
      nickname: dto.nickname,
      supersedesId: dto.supersedesId,

      currencyCode: dto.currencyCode,
      countryCode: dto.countryCode,
      bankName: dto.bankName,
      accountHolderName: dto.accountHolderName,
      accountNumberEncrypted: encryptSensitive(dto.accountNumber),
      accountLast4: last4(dto.accountNumber),
      swiftBic: dto.swiftBic,
      ibanEncrypted: dto.iban ? encryptSensitive(dto.iban) : undefined,
      routingNumber: dto.routingNumber,
      bankAddress: dto.bankAddress,
      accountHolderAddress: dto.accountHolderAddress,

      providerPayload: undefined,
      createdAt: now,
      updatedAt: now,
    } as Partial<BankAccount>);

    return created;
  }

  async updateForUser(
    id: string,
    user: User,
    dto: UpdateBankAccountDto,
  ): Promise<BankAccount> {
    if (user.accountType !== 'supplier') {
      // Buyers use a create-new-request flow; updates are for legacy/supplier in this scaffold.
      throw new BadRequestError('Only supplier accounts can be updated in-place');
    }

    const account = await this.getForUser(user, id);
    if (!account || account.archived) throw new BadRequestError('Bank account not found');
    if (account.accountType !== BankAccountOwnerType.Supplier) {
      throw new BadRequestError('Account type mismatch');
    }

    const now = new Date();

    // Enforce single non-archived supplier account by archiving others when updating.
    await this.bankAccounts.update(
      {
        userId: user.id,
        accountType: BankAccountOwnerType.Supplier,
        archived: { $ne: true },
        id: { $ne: id },
      } as any,
      { $set: { archived: true, isDefault: false, updatedAt: now } } as any,
    );

    const updated = await this.bankAccounts.updateById(account.id, {
      currencyCode: dto.currencyCode,
      countryCode: dto.countryCode,
      bankName: dto.bankName,
      accountHolderName: dto.accountHolderName,
      accountNumberEncrypted: encryptSensitive(dto.accountNumber),
      accountLast4: last4(dto.accountNumber),
      swiftBic: dto.swiftBic,
      accountHolderAddress: dto.accountHolderAddress,

      routingNumber: dto.routingNumber,
      ibanEncrypted: dto.iban ? encryptSensitive(dto.iban) : undefined,
      bankAddress: dto.bankAddress,

      status: BankAccountStatus.ACTIVE,
      isActive: true,
      isDefault: true,
      archived: false,
      updatedAt: now,
    } as any);

    if (!updated) throw new BadRequestError('Failed to update bank account');
    return updated;
  }

  /**
   * Used only for backward compatibility paths (legacy embedded bank details).
   */
  async activateAndSetDefault(user: User, id: string): Promise<BankAccount> {
    const account = await this.getForUser(user, id);
    const updated = await this.bankAccounts.updateById(account.id, {
      status: BankAccountStatus.ACTIVE,
      isActive: true,
      updatedAt: new Date(),
    } as any);
    if (!updated) throw new BadRequestError('Failed to activate bank account');
    return this.setDefault(user, updated.id);
  }

  async setDefault(user: User, id: string): Promise<BankAccount> {
    const account = await this.getForUser(user, id);
    if (account.status !== BankAccountStatus.ACTIVE) {
      throw new BadRequestError('Only ACTIVE accounts can be set as default');
    }

    // Unset other defaults (same provider) among non-archived accounts
    await this.bankAccounts.update(
      { userId: user.id, provider: account.provider, archived: { $ne: true } } as any,
      { $set: { isDefault: false } } as any,
    );

    const updated = await this.bankAccounts.updateById(account.id, {
      isDefault: true,
      updatedAt: new Date(),
    } as any);

    if (!updated) throw new BadRequestError('Failed to update default');
    return updated;
  }

  /**
   * Sync OSN organization bank activation state into local `BankAccount` rows.
   *
   * Why this exists:
   * OSN onboarding approval happens asynchronously (bank creation starts inactive).
   * We store providerAccountId and initial status from OSN, but we may need to
   * refresh `BankAccount.status/isActive` when OSN later flips `is_active`.
   *
   * Admin/system can call this periodically or on-demand.
   */
  async syncOsnOrganizationBanks(options?: {
    userId?: string;
    pendingOnly?: boolean;
  }): Promise<{ updated: number; checked: number; errors: number; transitions: number }> {
    const localFilter: any = {
      provider: BankAccountProvider.OSN,
      accountType: BankAccountOwnerType.Buyer,
      archived: { $ne: true },
    };
    if (options?.userId) localFilter.userId = options.userId;
    if (options?.pendingOnly) localFilter.status = BankAccountStatus.PENDING_APPROVAL;

    const localAccounts = await this.bankAccounts.find(localFilter as any);
    if (localAccounts.length === 0) {
      return { updated: 0, checked: 0, errors: 0, transitions: 0 };
    }

    const now = new Date();
    logger.debug(
      {
        loaded: localAccounts.length,
        pendingOnly: !!options?.pendingOnly,
        userId: options?.userId,
      },
      'OSN bank sync: loaded local accounts',
    );

    let fallbackOrganizationId: string | undefined;
    const ensureFallbackOrganizationId = async (): Promise<string | undefined> => {
      if (fallbackOrganizationId !== undefined) return fallbackOrganizationId;
      try {
        const runtimeSettings = await this.osnRuntimeSettings.getOsnRuntimeSettings();
        fallbackOrganizationId = runtimeSettings.organizationId || '';
      } catch (err) {
        logger.warn({ err }, 'OSN bank sync: failed to resolve runtime fallback organization');
        fallbackOrganizationId = '';
      }

      if (!fallbackOrganizationId) {
        logger.warn(
          { userId: options?.userId },
          'OSN bank sync: runtime fallback organization is missing',
        );
        return undefined;
      }
      logger.warn(
        { organizationId: fallbackOrganizationId },
        'OSN bank sync: using runtime fallback organization for accounts missing providerOrganizationId',
      );
      return fallbackOrganizationId;
    };

    const groups = new Map<string, BankAccount[]>();

    let updated = 0;
    let errors = 0;
    let transitions = 0;

    for (const local of localAccounts) {
      let orgId = local.providerOrganizationId;
      if (!orgId) {
        orgId = await ensureFallbackOrganizationId();
      }
      if (!orgId) {
        errors += 1;
        await this.bankAccounts.updateById(local.id, {
          lastSyncedAt: now,
          syncError: 'Missing providerOrganizationId and fallback runtime organizationId',
          updatedAt: now,
        } as any);
        logger.warn(
          {
            bankAccountId: local.id,
            providerAccountId: local.providerAccountId,
          },
          'OSN bank sync: skipped account due to missing organization context',
        );
        continue;
      }

      const existing = groups.get(orgId) || [];
      existing.push(local);
      groups.set(orgId, existing);
    }

    logger.debug(
      {
        groups: groups.size,
        organizationIds: Array.from(groups.keys()),
      },
      'OSN bank sync: grouped accounts by organization',
    );

    for (const [organizationId, groupAccounts] of groups.entries()) {
      let remoteBanks: any[] = [];
      try {
        remoteBanks = await this.osnService.listOrganizationBanks({
          organizationId,
        });
      } catch (err) {
        errors += groupAccounts.length;
        logger.warn(
          {
            err,
            organizationId,
            accountsChecked: groupAccounts.length,
          },
          'OSN bank sync: failed to fetch organization banks',
        );
        for (const local of groupAccounts) {
          await this.bankAccounts.updateById(local.id, {
            lastSyncedAt: now,
            syncError: 'Failed to fetch OSN organization banks',
            updatedAt: now,
          } as any);
          updated += 1;
        }
        continue;
      }

      logger.debug(
        {
          organizationId,
          accountsChecked: groupAccounts.length,
          remoteBankCount: remoteBanks.length,
        },
        'OSN bank sync: fetched remote organization banks',
      );

      const byId = new Map(remoteBanks.map((b) => [b.id, b]));

      for (const local of groupAccounts) {
        const remote = byId.get(local.providerAccountId);
        if (!remote) {
          logger.warn(
            {
              bankAccountId: local.id,
              providerAccountId: local.providerAccountId,
              providerOrganizationId: organizationId,
            },
            'OSN bank sync: remote bank id not found for local account',
          );
          const out = await this.bankAccounts.updateById(local.id, {
            lastSyncedAt: now,
            syncError: 'OSN bank account id not found in organization-banks list',
            updatedAt: now,
          } as any);
          if (out) updated += 1;
          errors += 1;
          continue;
        }

        const newStatus = remote.is_active
          ? BankAccountStatus.ACTIVE
          : BankAccountStatus.PENDING_APPROVAL;
        const nextPayload = {
          ...(local.providerPayload || {}),
          latestResponse: remote,
        };
        const transitionCandidate =
          local.status === BankAccountStatus.PENDING_APPROVAL &&
          newStatus === BankAccountStatus.ACTIVE;

        logger.debug(
          {
            bankAccountId: local.id,
            providerAccountId: local.providerAccountId,
            previousStatus: local.status,
            remoteIsActive: remote.is_active,
            nextStatus: newStatus,
            transitionCandidate,
          },
          'OSN bank sync: account evaluation',
        );

        if (transitionCandidate) {
          const transitionCount = await this.bankAccounts.update(
            {
              _id: local.id,
              status: BankAccountStatus.PENDING_APPROVAL,
              archived: { $ne: true },
            } as any,
            {
              $set: {
                status: BankAccountStatus.ACTIVE,
                isActive: true,
                providerOrganizationId: local.providerOrganizationId || organizationId,
                providerPayload: nextPayload,
                lastSyncedAt: now,
                syncError: undefined,
                updatedAt: now,
              },
            } as any,
          );

          if (transitionCount > 0) {
            updated += transitionCount;
            transitions += transitionCount;
            await this.ensureBuyerBankAccountApprovalNotifications(local.id);
            logger.debug(
              {
                bankAccountId: local.id,
                userId: local.userId,
                providerAccountId: local.providerAccountId,
              },
              'OSN bank sync: approval transition side effects requested',
            );
            continue;
          }
          logger.warn(
            {
              bankAccountId: local.id,
              providerAccountId: local.providerAccountId,
            },
            'OSN bank sync: transition candidate did not match atomic update guard; side effects skipped',
          );
        }

        const out = await this.bankAccounts.updateById(local.id, {
          status: newStatus,
          isActive: remote.is_active,
          providerOrganizationId: local.providerOrganizationId || organizationId,
          providerPayload: nextPayload,
          lastSyncedAt: now,
          syncError: undefined,
          updatedAt: now,
        } as any);
        if (out) updated += 1;
      }
    }

    await this.flushPendingBankAccountApprovalNotifications();

    return { updated, checked: localAccounts.length, errors, transitions };
  }

  async syncPendingBuyerAccountsForUserIfStale(user: User): Promise<void> {
    if (user.accountType !== BankAccountOwnerType.Buyer) return;

    const staleBefore = new Date(Date.now() - READ_SYNC_STALE_MS);
    const pending = await this.bankAccounts.findOne(
      {
        userId: user.id,
        provider: BankAccountProvider.OSN,
        accountType: BankAccountOwnerType.Buyer,
        status: BankAccountStatus.PENDING_APPROVAL,
        archived: { $ne: true },
        $or: [{ lastSyncedAt: { $exists: false } }, { lastSyncedAt: { $lt: staleBefore } }],
      } as any,
    );

    if (!pending) return;

    try {
      await this.syncOsnOrganizationBanks({ userId: user.id, pendingOnly: true });
    } catch {
      // Avoid breaking list endpoint on transient OSN failures.
    }
  }

  /**
   * Sends buyer in-app + email once per bank account (idempotent via timestamps on `BankAccount`).
   */
  private async ensureBuyerBankAccountApprovalNotifications(
    bankAccountId: string,
  ): Promise<void> {
    const account = await this.bankAccounts.findById(bankAccountId);
    if (!account) return;
    const user = await this.users.findById(account.userId);
    if (!user?.email) {
      logger.warn(
        { bankAccountId, userId: account.userId },
        'bank account approval: skip — buyer user email missing',
      );
      return;
    }

    const displayName = user.company?.name || user.email.split('@')[0];

    if (!account.approvalInAppNotificationSentAt) {
      logger.info(
        { eventName: 'bank_account_approved', bankAccountId, userId: user.id },
        'bank account approval: in-app notification started',
      );
      try {
        await this.notificationsService.sendBankAccountApprovedBuyerInApp(user.email);
        await this.bankAccounts.updateById(account.id, {
          approvalInAppNotificationSentAt: new Date(),
        } as any);
        logger.info(
          { bankAccountId, userId: user.id },
          'bank account approval: in-app notification persisted',
        );
      } catch (err) {
        logger.warn({ err, bankAccountId }, 'bank account approval: in-app notification failed');
      }
    } else {
      logger.debug(
        { bankAccountId },
        'bank account approval: in-app skipped — already sent',
      );
    }

    const refreshed = await this.bankAccounts.findById(bankAccountId);
    if (!refreshed?.approvalEmailSentAt) {
      logger.info(
        { eventName: 'bank_account_approved', bankAccountId, userId: user.id },
        'bank account approval: email started',
      );
      try {
        await this.notificationsService.sendBankAccountApprovedBuyerEmail(user.email, {
          userName: displayName,
          bankName: refreshed!.bankName,
          currency: refreshed!.currencyCode,
          accountLast4: refreshed!.accountLast4,
        });
        await this.bankAccounts.updateById(refreshed!.id, {
          approvalEmailSentAt: new Date(),
        } as any);
        logger.info({ bankAccountId }, 'bank account approval: email persisted');
      } catch (err) {
        logger.warn({ err, bankAccountId }, 'bank account approval: email failed');
      }
    } else {
      logger.debug({ bankAccountId }, 'bank account approval: email skipped — already sent');
    }
  }

  /**
   * Retries approval notifications for ACTIVE OSN buyer accounts missing sent timestamps (safe after transient failures).
   */
  private async flushPendingBankAccountApprovalNotifications(): Promise<void> {
    const pending = await this.bankAccounts.find({
      provider: BankAccountProvider.OSN,
      accountType: BankAccountOwnerType.Buyer,
      status: BankAccountStatus.ACTIVE,
      archived: { $ne: true },
      $or: [
        { approvalInAppNotificationSentAt: { $exists: false } },
        { approvalEmailSentAt: { $exists: false } },
      ],
    } as any);

    for (const a of pending) {
      await this.ensureBuyerBankAccountApprovalNotifications(a.id);
    }
  }
}

