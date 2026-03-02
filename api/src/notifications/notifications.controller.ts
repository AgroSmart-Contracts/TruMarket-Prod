import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticatedRestricted } from '@/decorators/authenticatedRestricted';
import { BadRequestError } from '@/errors';
import { User } from '@/users/users.entities';

import { ListNotificationsDto } from './dto/listNotifications.dto';
import { ListNotificationsResponseDto } from './dto/listNotificationsResponse.dto';
import { UpdateNotificationsDto } from './dto/updateNotifications.dto';
import { NotificationsService } from './notifications.service';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get()
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: 200,
    type: [ListNotificationsResponseDto],
    description: 'Returns all notifications for the user.',
  })
  async findAll(
    @Request() req,
    @Query() query: ListNotificationsDto,
  ): Promise<ListNotificationsResponseDto[]> {
    const user: User = req.user;

    const notifications =
      await this.notificationsService.findNotificationsByEmail(
        user.email,
        query.offset,
      );

    return notifications.data.map(
      (notification) => new ListNotificationsResponseDto(notification),
    );
  }

  @Put()
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Update notifications' })
  @ApiResponse({
    status: 200,
  })
  async read(
    @Request() req,
    @Body() payload: UpdateNotificationsDto,
  ): Promise<void> {
    const user: User = req.user;

    if (!payload.read) {
      throw new BadRequestError('"read" is the only operation allowed');
    } else if (!payload.id && !payload.dealId) {
      throw new BadRequestError('Either "id" or "dealId" must be provided');
    }

    if (payload.id) {
      return this.notificationsService.markAsRead(user.email, payload.id);
    } else if (payload.dealId) {
      return this.notificationsService.markAsReadByDealId(
        user.email,
        payload.dealId,
      );
    }
  }

  @Post('/subscribe')
  @AuthenticatedRestricted()
  @ApiOperation({ summary: 'Subscribe to server notifications' })
  @ApiResponse({
    status: 200,
  })
  async subscribe(@Request() req, @Body() payload: any) {
    const user: User = req.user;

    if (!payload.subscription) {
      throw new BadRequestError('Subscription object is required');
    }

    return this.subscriptionsService.register(user.email, payload.subscription);
  }
}
