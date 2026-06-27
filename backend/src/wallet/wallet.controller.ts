import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
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
  async getTransactions(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.walletService.getTransactions(req.user.id, page, limit);
    return successResponse(result);
  }
}
