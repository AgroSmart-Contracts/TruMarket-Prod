import { AccountType, Company, User } from '@/users/users.entities';
import { UsersService } from '@/users/users.service';

import { DealCompany } from './deals.entities';
import { CompanyDTO } from './dto/createDeal.dto';

export const EMPTY_DEAL_COMPANY: DealCompany = {
  name: '',
  country: '',
  taxId: '',
};

export function dealCompanyFromProfile(
  company?: Company,
): DealCompany | undefined {
  const name = company?.name?.trim();
  if (!name) {
    return undefined;
  }
  return {
    name,
    country: company?.country?.trim() ?? '',
    taxId: company?.taxId?.trim() ?? '',
  };
}

export function pickDealCompany(
  fromPayload?: DealCompany | CompanyDTO,
  ...fallbacks: (DealCompany | undefined)[]
): DealCompany {
  if (fromPayload?.name?.trim()) {
    return {
      name: fromPayload.name.trim(),
      country: fromPayload.country?.trim() ?? '',
      taxId: fromPayload.taxId?.trim() ?? '',
    };
  }
  for (const candidate of fallbacks) {
    if (candidate?.name?.trim()) {
      return candidate;
    }
  }
  return EMPTY_DEAL_COMPANY;
}

/**
 * Resolves buyer/supplier company snapshots from request payload, creator profile,
 * and registered counterparty emails (primary email on each side).
 */
export async function resolveDealCompanies(
  users: UsersService,
  creator: User,
  input: {
    buyerCompany?: DealCompany | CompanyDTO;
    supplierCompany?: DealCompany | CompanyDTO;
    buyersEmails: string[];
    suppliersEmails: string[];
  },
): Promise<{ buyerCompany: DealCompany; supplierCompany: DealCompany }> {
  const primaryBuyerEmail = input.buyersEmails[0];
  const primarySupplierEmail = input.suppliersEmails[0];

  const [buyerUser, supplierUser] = await Promise.all([
    primaryBuyerEmail ? users.findByEmail(primaryBuyerEmail) : undefined,
    primarySupplierEmail ? users.findByEmail(primarySupplierEmail) : undefined,
  ]);

  const creatorCompany = dealCompanyFromProfile(creator.company);
  const buyerProfileCompany = dealCompanyFromProfile(buyerUser?.company);
  const supplierProfileCompany = dealCompanyFromProfile(supplierUser?.company);

  const buyerCompany = pickDealCompany(
    input.buyerCompany,
    creator.accountType === AccountType.Buyer ? creatorCompany : undefined,
    buyerProfileCompany,
  );

  const supplierCompany = pickDealCompany(
    input.supplierCompany,
    creator.accountType === AccountType.Supplier ? creatorCompany : undefined,
    supplierProfileCompany,
  );

  return { buyerCompany, supplierCompany };
}
