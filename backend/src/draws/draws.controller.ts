import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DrawsService } from './draws.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { successResponse } from '../common/response.util';
import { Request } from 'express';

@Controller('draws')
export class DrawsController {
  constructor(private drawsService: DrawsService) {}

  @Get('active')
  async getActiveDraws() {
    const draws = await this.drawsService.getActiveDraws();
    return successResponse(draws);
  }

  @Get('completed')
  async getCompletedDraws(@Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.drawsService.getCompletedDraws(page, limit);
    return successResponse(result);
  }

  @Get(':id')
  async getDraw(@Param('id') id: string) {
    const draw = await this.drawsService.getDraw(id);
    return successResponse(draw);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createDraw(@Body() body: { title: string; description?: string; ticketPrice: number; maxTickets: number; winnerCount?: number; scheduledAt: string }) {
    const draw = await this.drawsService.createDraw({
      ...body,
      scheduledAt: new Date(body.scheduledAt),
    });
    return successResponse(draw, 'Draw created');
  }

  @Patch(':id/open')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async openDraw(@Param('id') id: string) {
    const draw = await this.drawsService.openDraw(id);
    return successResponse(draw, 'Draw opened for ticket sales');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateDraw(@Param('id') id: string, @Body() body: any) {
    const draw = await this.drawsService.updateDraw(id, body);
    return successResponse(draw, 'Draw updated');
  }

  @Post(':id/execute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async executeDraw(@Param('id') id: string) {
    const result = await this.drawsService.executeDraw(id);
    return successResponse(result, 'Draw executed successfully');
  }
}
