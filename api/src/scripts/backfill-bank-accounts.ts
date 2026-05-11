/* eslint-disable no-console */
import { config } from '@/config';
import { connectDB } from '@/infra/database/connectDB';
import UserModel from '@/infra/database/users.model';
import { BankAccountsModel } from '@/infra/database/bank-accounts.model';
import {
  BankAccountOwnerType,
  BankAccountProvider,
  BankAccountStatus,
} from '@/bank-accounts/bank-accounts.entities';

function encryptSensitive(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64');
}

function last4(input: string): string {
  return (input || '').replace(/\s+/g, '').slice(-4);
}

async function main() {
  const conn = await connectDB(config.databaseUrl);
  console.log('[backfill-bank-accounts] connected');

  // NOTE: `bankDetails` is legacy and no longer part of the schema, but may still exist in stored docs.
  const legacyUsers: any[] = await (UserModel as any)
    .find({ bankDetails: { $exists: true, $ne: null } })
    .lean();

  console.log(`[backfill-bank-accounts] users with legacy bankDetails: ${legacyUsers.length}`);

  let created = 0;
  let skipped = 0;

  for (const u of legacyUsers) {
    const bankDetails = u.bankDetails;
    if (!bankDetails?.accountNumber || !bankDetails?.swiftCode || !bankDetails?.beneficiaryName) {
      skipped += 1;
      continue;
    }

    const existing = await BankAccountsModel.findOne({
      userId: u._id.toString(),
      archived: false,
      provider: BankAccountProvider.LEGACY,
    }).lean();
    if (existing) {
      skipped += 1;
      continue;
    }

    const accountHolderAddress = [
      bankDetails.addressLine1,
      bankDetails.city,
      bankDetails.postalCode,
    ]
      .filter(Boolean)
      .join(', ');

    await BankAccountsModel.create({
      userId: u._id.toString(),
      accountType:
        u.accountType === BankAccountOwnerType.Supplier
          ? BankAccountOwnerType.Supplier
          : BankAccountOwnerType.Buyer,
      provider: BankAccountProvider.LEGACY,
      providerAccountId: `legacy_user_${u._id.toString()}`,
      status: BankAccountStatus.ACTIVE,
      isActive: true,
      isDefault: true,
      archived: false,
      nickname: 'Legacy bank account',
      currencyCode: 'USD', // default choice when unknown; user can update later
      countryCode: (bankDetails.country || 'US').toUpperCase(),
      bankName: bankDetails.bankName || 'Bank',
      accountHolderName: bankDetails.beneficiaryName,
      accountNumberEncrypted: encryptSensitive(bankDetails.accountNumber),
      accountLast4: last4(bankDetails.accountNumber),
      swiftBic: (bankDetails.swiftCode || '').toUpperCase(),
      accountHolderAddress: accountHolderAddress || undefined,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      updatedAt: new Date(),
      providerPayload: { source: 'legacy_User.bankDetails' },
    });

    created += 1;
  }

  console.log(`[backfill-bank-accounts] created=${created} skipped=${skipped}`);
  await conn.close();
  console.log('[backfill-bank-accounts] done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

