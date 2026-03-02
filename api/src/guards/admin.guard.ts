import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

import { providers } from '@/constants';
import { RoleType, User } from '@/users/users.entities';
import { UsersRepository } from '@/users/users.repository';

import { ForbiddenError, UnauthorizedError } from '../errors';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(providers.UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new UnauthorizedError();
    }

    const { walletAddress } = request.user as any;

    const user: User =
      await this.usersRepository.findByWalletAddress(walletAddress);

    if (user && user.role === RoleType.ADMIN) {
      return true;
    }

    throw new ForbiddenError();
  }
}
