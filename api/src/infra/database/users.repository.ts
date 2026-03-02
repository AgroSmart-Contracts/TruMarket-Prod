import { Injectable } from '@nestjs/common';

import { User } from '@/users/users.entities';
import { UsersRepository } from '@/users/users.repository';

import { MongooseRepository } from './repository.mongoose';
import UserModel from './users.model';

@Injectable()
export class UsersMongooseRepository
  extends MongooseRepository<User>
  implements UsersRepository
{
  constructor() {
    super(UserModel);
  }

  findByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return this.findOne({ walletAddress });
  }

  findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email });
  }

  findByEmails(emails: string[]): Promise<User[] | undefined> {
    return this.find({ email: { $in: emails } });
  }
}
