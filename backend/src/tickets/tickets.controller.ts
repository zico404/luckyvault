import { Controller, Get, Post, Param, Query, UseGuards, Body, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { successResponse } from '../common/response.util';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  async purchaseTicket(@Req() req: any, @Body() body: { drawId: string }) {
    const ticket = await this.ticketsService.purchaseTicket(req.user.id, body.drawId);
    return successResponse(ticket, 'Ticket purchased successfully');
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyTickets(@Req() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    const result = await this.ticketsService.getMyTickets(req.user.id, parseInt(page, 10) || 1, parseInt(limit, 10) || 20);
    return successResponse(result);
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  async getTicketByCode(@Req() req: any, @Param('code') code: string) {
    const ticket = await this.ticketsService.getTicketByCode(req.user.id, code);
    return successResponse(ticket);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTicket(@Req() req: any, @Param('id') id: string) {
    const ticket = await this.ticketsService.getTicketById(req.user.id, id);
    return successResponse(ticket);
  }
}
