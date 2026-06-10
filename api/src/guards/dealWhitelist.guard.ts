import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { DealsService } from '@/deals/deals.service';
import { RoleType } from '@/users/users.entities';
import { UsersService } from '@/users/users.service';

import { ForbiddenError, UnauthorizedError } from '../errors';

@Injectable()
export class DealWhitelistGuard implements CanActivate {
  constructor(
    private readonly dealsService: DealsService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new UnauthorizedError();
    }

    const user = await this.userService.findByWalletAddress(
      request.user.address,
    );

    const { address } = request.user;

    if (user && user.role === RoleType.ADMIN) {
      return true;
    }

    const dealId = request.params.dealId; // Extract the deal ID from the URL params

    // Retrieve the deal and check if the user's address is in the whitelist
    const deal = await this.dealsService.findDealById(dealId);
    if (deal && deal.whitelist.includes(address)) {
      return true;
    }

    throw new ForbiddenError();
  }
}
