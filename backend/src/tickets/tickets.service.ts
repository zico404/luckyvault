import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { TicketStatus, TransactionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { createHash } from 'crypto';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async purchaseTicket(userId: string, drawId: string) {
    const draw = await this.prisma.draw.findUnique({ where: { id: drawId } });
    if (!draw) throw new NotFoundException('Draw not found');
    if (draw.status !== 'OPEN') throw new BadRequestException('Draw is not accepting tickets');
    if (draw.soldTickets >= draw.maxTickets) throw new BadRequestException('Draw is sold out');

    const existingTicket = await this.prisma.ticket.findFirst({
      where: { userId, drawId, status: { not: TicketStatus.REFUNDED } },
    });
    if (existingTicket) throw new BadRequestException('You already have a ticket for this draw');

    const ticketId = uuidv4();
    const rawCode = `${ticketId}-${drawId}-${Date.now()}`;
    const ticketCode = createHash('sha256').update(rawCode).digest('hex').substring(0, 16).toUpperCase();

    const debitResult = await this.walletService.debit(
      userId,
      Number(draw.ticketPrice),
      TransactionType.PURCHASE,
      `Ticket purchase for draw: ${draw.title}`,
      ticketId,
      { drawId, ticketCode },
    );

    const qrData = JSON.stringify({ ticketId, ticketCode, drawId });
    const qrCodeUrl = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

    const ticket = await this.prisma.$transaction(async (tx) => {
      const t = await tx.ticket.create({
        data: {
          id: ticketId,
          userId,
          drawId,
          ticketCode,
          purchasePrice: draw.ticketPrice,
          qrCodeUrl,
        },
      });

      await tx.draw.update({
        where: { id: drawId },
        data: {
          soldTickets: { increment: 1 },
          prizePool: { increment: draw.ticketPrice },
        },
      });

      return t;
    });

    return ticket;
  }

  async getMyTickets(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { userId },
        include: { draw: { select: { id: true, title: true, status: true, scheduledAt: true, completedAt: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where: { userId } }),
    ]);

    return { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getTicketById(userId: string, ticketId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
      include: { draw: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async getTicketByCode(ticketCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode },
      include: { draw: { select: { id: true, title: true, status: true, scheduledAt: true } } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
}
