import { Repository } from '@/repository';

import { User } from './users.entities';

export interface UsersRepository extends Repository<User> {
  findByWalletAddress(walletAddress: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  findByEmails(emails: string[]): Promise<User[] | undefined>;
}
