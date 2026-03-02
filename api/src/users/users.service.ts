import { Inject, Injectable } from '@nestjs/common';

import { providers } from '@/constants';

import { logger } from '../logger';
import { NotificationsSettings, User, WalletType } from './users.entities';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(providers.UsersRepository)
    private readonly users: UsersRepository,
  ) {}

  async findByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return this.users.findByWalletAddress(walletAddress);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.findByEmail(email);
  }

  async findByEmails(emails: string[]): Promise<User[] | undefined> {
    return this.users.findByEmails(emails);
  }

  async findAll(): Promise<User[] | undefined> {
    return this.users.findAll();
  }

  async create(createUserDto: Partial<User>): Promise<User> {
    logger.debug({ createUserDto }, 'Creating new user');

    if (createUserDto.walletType === 'ethereum') {
      createUserDto.walletType = WalletType.EVM;
    }

    return this.users.create(createUserDto);
  }

  async updateById(
    userId: string,
    update: Partial<User>,
  ): Promise<User | undefined> {
    logger.debug({ userId, update }, 'Updating user by ID');
    const result = await this.users.updateById(userId, update);
    logger.debug({ userId, result, bankDetailsInResult: result?.bankDetails }, 'User updated by ID');
    return result;
  }

  async updateNotificationsSettings(
    userId: string,
    desktopNotifications: NotificationsSettings,
    emailNotifications: NotificationsSettings,
  ): Promise<User | undefined> {
    return this.users.updateById(userId, {
      desktopNotifications,
      emailNotifications,
    });
  }
}
