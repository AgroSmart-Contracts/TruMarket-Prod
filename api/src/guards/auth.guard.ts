import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type Request } from 'express';

import { logger } from '@/logger';

import { config } from '../config';
import { UnauthorizedError } from '../errors';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedError();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: config.jwtSecret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request.user = payload;
    } catch (err) {
      logger.warn(err, 'Error verifying JWT token');
      throw new UnauthorizedError();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') || [];
    return type === 'Bearer' ? token : undefined;
  }
}
