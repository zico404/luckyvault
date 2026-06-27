import { Controller, Get, Post, Param, Query, UseGuards, Body } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { successResponse } from '../common/response.util';
import { Request } from 'express';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  async purchaseTicket(@Request() req, @Body() body: { drawId: string }) {
    const ticket = await this.ticketsService.purchaseTicket(req.user.id, body.drawId);
    return successResponse(ticket, 'Ticket purchased successfully');
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyTickets(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.ticketsService.getMyTickets(req.user.id, page, limit);
    return successResponse(result);
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  async getTicketByCode(@Param('code') code: string) {
    const ticket = await this.ticketsService.getTicketByCode(code);
    return successResponse(ticket);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTicket(@Request() req, @Param('id') id: string) {
    const ticket = await this.ticketsService.getTicketById(req.user.id, id);
    return successResponse(ticket);
  }
}
