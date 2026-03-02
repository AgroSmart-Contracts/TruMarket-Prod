import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse } from '@nestjs/swagger';

import { AuthGuard } from '../guards/auth.guard';

export function AuthenticatedRestricted() {
  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(AuthGuard),
    ApiForbiddenResponse({ description: 'Access restricted to admin users' }),
  );
}
