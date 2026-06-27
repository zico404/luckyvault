import { Controller, Get, Post, Body, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { successResponse } from '../common/response.util';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@Request() req) {
    const result = await this.walletService.getBalance(req.user.id);
    return successResponse(result);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getTransactions(@Request() req, @Query('page') page = '1', @Query('limit') limit = '20') {
    const result = await this.walletService.getTransactions(req.user.id, parseInt(page, 10) || 1, parseInt(limit, 10) || 20);
    return successResponse(result);
  }

  @Post('topup')
  @UseGuards(JwtAuthGuard)
  async topUp(@Request() req, @Body() body: { amount: number; paymentMethod: string }) {
    const { amount, paymentMethod } = body;
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    if (amount > 10000) {
      throw new BadRequestException('Maximum top-up amount is $10,000');
    }
    if (!paymentMethod) {
      throw new BadRequestException('Payment method is required');
    }

    const result = await this.walletService.topUp(
      req.user.id,
      amount,
      paymentMethod,
    );
    return successResponse(result, 'Top-up request submitted. Waiting for admin approval.');
  }
}
