import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { successResponse } from '../common/response.util';
import { Request } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.notificationsService.getNotifications(req.user.id, page, limit);
    return successResponse(result);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Request() req) {
    const result = await this.notificationsService.getUnreadCount(req.user.id);
    return successResponse(result);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return successResponse(null, 'All marked as read');
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Request() req, @Param('id') id: string) {
    await this.notificationsService.markAsRead(req.user.id, id);
    return successResponse(null, 'Marked as read');
  }
}
