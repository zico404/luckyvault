import { Controller, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { successResponse } from '../common/response.util';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    const result = await this.notificationsService.getNotifications(req.user.id, parseInt(page, 10) || 1, parseInt(limit, 10) || 20);
    return successResponse(result);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Req() req: any) {
    const result = await this.notificationsService.getUnreadCount(req.user.id);
    return successResponse(result);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req: any) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return successResponse(null, 'All marked as read');
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    await this.notificationsService.markAsRead(req.user.id, id);
    return successResponse(null, 'Marked as read');
  }
}
