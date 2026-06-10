import { Injectable } from '@nestjs/common';

import { BankAccountsRepository } from '@/bank-accounts/bank-accounts.repository';

import { BankAccount } from '../../bank-accounts/bank-accounts.entities';
import { BankAccountsModel } from './bank-accounts.model';
import { MongooseRepository } from './repository.mongoose';

@Injectable()
export class BankAccountsMongooseRepository
  extends MongooseRepository<BankAccount>
  implements BankAccountsRepository
{
  constructor() {
    super(BankAccountsModel);
  }
}
