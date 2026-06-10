import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AdminAccessRestricted } from '@/decorators/adminRestricted';

import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @AdminAccessRestricted()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    // type: [],
    description: 'Returns all users.',
  })
  async findAll(): Promise<any[]> {
    const users = await this.usersService.findAll();

    return users;
  }
}
