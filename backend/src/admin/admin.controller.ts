import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { DrawsService } from '../draws/draws.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { WalletService } from '../wallet/wallet.service';
import { successResponse } from '../common/response.util';
import { CreateDrawDto, UpdateDrawDto } from './dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private drawsService: DrawsService,
    private usersService: UsersService,
    private auditService: AuditService,
    private walletService: WalletService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return successResponse({
      message: 'Admin dashboard',
      endpoints: [
        'GET /admin/users',
        'GET /admin/draws',
        'POST /admin/draws',
        'POST /admin/draws/:id/execute',
        'GET /admin/topups/pending',
        'POST /admin/topups/:id/approve',
        'POST /admin/topups/:id/reject',
        'GET /admin/audit-logs',
      ],
    });
  }

  @Get('users')
  async getUsers(@Query('page') page = '1', @Query('limit') limit = '20') {
    const result = await this.usersService.findAll(parseInt(page, 10) || 1, parseInt(limit, 10) || 20);
    return successResponse(result);
  }

  @Get('draws')
  async getDraws(@Query('page') page = '1', @Query('limit') limit = '20') {
    const result = await this.drawsService.getCompletedDraws(parseInt(page, 10) || 1, parseInt(limit, 10) || 20);
    return successResponse(result);
  }

  @Post('draws')
  async createDraw(@Body() dto: CreateDrawDto) {
    const draw = await this.drawsService.createDraw({
      title: dto.title,
      description: dto.description,
      ticketPrice: dto.ticketPrice,
      maxTickets: dto.maxTickets,
      winnerCount: dto.winnerCount || 1,
      scheduledAt: new Date(dto.scheduledAt),
    });
    return successResponse(draw, 'Draw created');
  }

  @Patch('draws/:id')
  async updateDraw(@Param('id') id: string, @Body() dto: UpdateDrawDto) {
    const updateData: any = { ...dto };
    if (dto.scheduledAt) {
      updateData.scheduledAt = new Date(dto.scheduledAt);
    }
    const draw = await this.drawsService.updateDraw(id, updateData);
    return successResponse(draw, 'Draw updated');
  }

  @Patch('draws/:id/open')
  async openDraw(@Param('id') id: string) {
    const draw = await this.drawsService.openDraw(id);
    return successResponse(draw, 'Draw opened');
  }

  @Post('draws/:id/execute')
  async executeDraw(@Param('id') id: string) {
    const result = await this.drawsService.executeDraw(id);
    return successResponse(result, 'Draw executed');
  }

  @Get('topups/pending')
  async getPendingTopUps() {
    const result = await this.walletService.getPendingTopUps();
    return successResponse(result);
  }

  @Post('topups/:id/approve')
  async approveTopUp(@Param('id') id: string) {
    const result = await this.walletService.approveTopUp(id);
    return successResponse(result, 'Top-up approved');
  }

  @Post('topups/:id/reject')
  async rejectTopUp(@Param('id') id: string) {
    const result = await this.walletService.rejectTopUp(id);
    return successResponse(result, 'Top-up rejected');
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('userId') userId?: string,
    @Query('action') action?: any,
    @Query('entity') entity?: string,
  ) {
    const result = await this.auditService.getLogs(parseInt(page, 10) || 1, parseInt(limit, 10) || 50, { userId, action, entity });
    return successResponse(result);
  }
}
