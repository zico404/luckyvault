import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return { balance: wallet.balance, currency: wallet.currency };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { walletId: wallet.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where: { walletId: wallet.id } }),
    ]);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async credit(userId: string, amount: number, type: TransactionType, description: string, referenceId?: string, metadata?: any) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const newBalance = new Decimal(wallet.balance).plus(amount);
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });

      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          balanceAfter: newBalance,
          status: TransactionStatus.COMPLETED,
          referenceId,
          description,
          metadata,
        },
      });

      return { transaction, newBalance };
    });
  }

  async debit(userId: string, amount: number, type: TransactionType, description: string, referenceId?: string, metadata?: any) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const currentBalance = new Decimal(wallet.balance);
      if (currentBalance.lessThan(amount)) {
        throw new BadRequestException('Insufficient balance');
      }

      const newBalance = currentBalance.minus(amount);
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });

      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          balanceAfter: newBalance,
          status: TransactionStatus.COMPLETED,
          referenceId,
          description,
          metadata,
        },
      });

      return { transaction, newBalance };
    });
  }
}
