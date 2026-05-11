import { Repository } from '@/repository';

import { BankAccount } from './bank-accounts.entities';

export interface BankAccountsRepository extends Repository<BankAccount> {}

