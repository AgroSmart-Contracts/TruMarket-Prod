import { Injectable } from '@nestjs/common';

import { BankAccountsRepository } from '@/bank-accounts/bank-accounts.repository';

import { BankAccount } from '../../bank-accounts/bank-accounts.entities';
import { MongooseRepository } from './repository.mongoose';
import { BankAccountsModel } from './bank-accounts.model';

@Injectable()
export class BankAccountsMongooseRepository
  extends MongooseRepository<BankAccount>
  implements BankAccountsRepository
{
  constructor() {
    super(BankAccountsModel);
  }
}

