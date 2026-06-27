import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DrawStatus, TicketStatus, TransactionType } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class DrawsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
  ) {}

  async createDraw(data: {
    title: string;
    description?: string;
    ticketPrice: number;
    maxTickets: number;
    winnerCount: number;
    scheduledAt: Date;
  }) {
    return this.prisma.draw.create({
      data: {
        title: data.title,
        description: data.description,
        ticketPrice: data.ticketPrice,
        maxTickets: data.maxTickets,
        winnerCount: data.winnerCount || 1,
        scheduledAt: data.scheduledAt,
        status: DrawStatus.UPCOMING,
      },
    });
  }

  async updateDraw(drawId: string, data: Partial<{
    title: string;
    description: string;
    ticketPrice: number;
    maxTickets: number;
    winnerCount: number;
    scheduledAt: Date;
  }>) {
    const draw = await this.prisma.draw.findUnique({ where: { id: drawId } });
    if (!draw) throw new NotFoundException('Draw not found');
    if (draw.status !== DrawStatus.UPCOMING && draw.status !== DrawStatus.OPEN) {
      throw new BadRequestException('Cannot modify a draw that has started');
    }
    return this.prisma.draw.update({ where: { id: drawId }, data });
  }

  async openDraw(drawId: string) {
    const draw = await this.prisma.draw.findUnique({ where: { id: drawId } });
    if (!draw) throw new NotFoundException('Draw not found');
    if (draw.status !== DrawStatus.UPCOMING) throw new BadRequestException('Draw is not in UPCOMING status');
    return this.prisma.draw.update({ where: { id: drawId }, data: { status: DrawStatus.OPEN } });
  }

  async getActiveDraws() {
    return this.prisma.draw.findMany({
      where: { status: { in: [DrawStatus.OPEN, DrawStatus.UPCOMING] } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getDraw(drawId: string) {
    const draw = await this.prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        tickets: { select: { id: true, ticketCode: true, userId: true, status: true } },
        winners: true,
      },
    });
    if (!draw) throw new NotFoundException('Draw not found');
    return draw;
  }

  async getCompletedDraws(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [draws, total] = await Promise.all([
      this.prisma.draw.findMany({
        where: { status: DrawStatus.COMPLETED },
        include: { winners: { include: { ticket: { select: { ticketCode: true } } } } },
        skip,
        take: limit,
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.draw.count({ where: { status: DrawStatus.COMPLETED } }),
    ]);
    return { draws, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async executeDraw(drawId: string) {
    const draw = await this.prisma.draw.findUnique({ where: { id: drawId } });
    if (!draw) throw new NotFoundException('Draw not found');
    if (draw.status !== DrawStatus.OPEN && draw.status !== DrawStatus.LOCKED) {
      throw new BadRequestException('Draw cannot be executed in current status');
    }

    // Lock the draw
    await this.prisma.draw.update({
      where: { id: drawId },
      data: { status: DrawStatus.LOCKED, startedAt: new Date() },
    });

    try {
      // Fetch all valid tickets
      const tickets = await this.prisma.ticket.findMany({
        where: { drawId, status: TicketStatus.ACTIVE },
      });

      if (tickets.length === 0) {
        const salt = randomBytes(32).toString('hex');
        const resultHash = createHash('sha256').update(`${drawId}-${salt}`).digest('hex');
        await this.prisma.draw.update({
          where: { id: drawId },
          data: { status: DrawStatus.COMPLETED, completedAt: new Date(), resultHash, resultSalt: salt },
        });
        return { drawId, winners: [], resultHash, message: 'No valid tickets' };
      }

      // Generate cryptographically secure random selection
      const salt = randomBytes(32).toString('hex');
      const resultHash = createHash('sha512')
        .update(`${drawId}-${salt}-${Date.now()}-${JSON.stringify(tickets.map(t => t.id))}`)
        .digest('hex');

      // Select winners using secure randomness
      const shuffled = this.secureShuffle(tickets, resultHash);
      const winnerCount = Math.min(draw.winnerCount, shuffled.length);
      const selectedWinners = shuffled.slice(0, winnerCount);

      const prizePerWinner = Number(draw.prizePool) / winnerCount;

      // Persist results atomically
      await this.prisma.$transaction(async (tx) => {
        // Mark all tickets as LOST first
        await tx.ticket.updateMany({
          where: { drawId, status: TicketStatus.ACTIVE },
          data: { status: TicketStatus.LOST },
        });

        // Mark winners as WON
        for (const ticket of selectedWinners) {
          await tx.ticket.update({
            where: { id: ticket.id },
            data: { status: TicketStatus.WON },
          });

          await tx.winner.create({
            data: {
              drawId,
              ticketId: ticket.id,
              userId: ticket.userId,
              prizeAmount: prizePerWinner,
              rank: selectedWinners.indexOf(ticket) + 1,
            },
          });

          // Credit prize to winner's wallet
          const wallet = await tx.wallet.findUnique({ where: { userId: ticket.userId } });
          if (wallet) {
            const newBalance = Number(wallet.balance) + prizePerWinner;
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { balance: newBalance },
            });

            await tx.transaction.create({
              data: {
                walletId: wallet.id,
                type: TransactionType.WINNING,
                amount: prizePerWinner,
                balanceAfter: newBalance,
                status: 'COMPLETED',
                referenceId: drawId,
                description: `Prize won from draw: ${draw.title}`,
                metadata: { drawId, ticketId: ticket.id, rank: selectedWinners.indexOf(ticket) + 1 },
              },
            });
          }
        }

        // Mark draw as completed
        await tx.draw.update({
          where: { id: drawId },
          data: {
            status: DrawStatus.COMPLETED,
            completedAt: new Date(),
            resultHash,
            resultSalt: salt,
          },
        });
      });

      // Send notifications (non-blocking)
      for (const ticket of selectedWinners) {
        this.notificationsService.sendNotification(
          ticket.userId,
          'Winner!',
          `Congratulations! You won $${prizePerWinner} from ${draw.title}!`,
          'WINNER',
          { drawId, prizeAmount: prizePerWinner },
        ).catch(() => {});
      }

      return { drawId, winners: selectedWinners.map((t, i) => ({ ticketId: t.id, userId: t.userId, prize: prizePerWinner, rank: i + 1 })), resultHash, resultSalt: salt };
    } catch (error) {
      // Rollback draw status on failure
      await this.prisma.draw.update({
        where: { id: drawId },
        data: { status: DrawStatus.OPEN, startedAt: null },
      });
      throw error;
    }
  }

  private secureShuffle<T>(array: T[], seed: string): T[] {
    const result = [...array];
    let currentIndex = result.length;
    let seedIndex = 0;

    while (currentIndex > 1) {
      const seedByte = seed.charCodeAt(seedIndex % seed.length);
      seedIndex++;
      currentIndex--;
      const swapIndex = (seedByte + currentIndex) % (currentIndex + 1);
      [result[currentIndex], result[swapIndex]] = [result[swapIndex], result[currentIndex]];
    }

    return result;
  }
}
