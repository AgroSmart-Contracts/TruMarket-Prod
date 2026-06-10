import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse } from '@nestjs/swagger';

import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../guards/auth.guard';

export function AdminAccessRestricted() {
  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(AuthGuard),
    UseGuards(AdminGuard),
    ApiForbiddenResponse({ description: 'Access restricted to admin users' }),
  );
}
