import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, displayName?: string, phone?: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new ConflictException('An account with this email already exists');
        }
        throw new ConflictException('An account with this phone number already exists');
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await this.prisma.user.create({
        data: {
          email,
          phone: phone || null,
          passwordHash,
          displayName: displayName || email.split('@')[0],
        },
      });

      await this.prisma.wallet.create({
        data: { userId: user.id, balance: 0 },
      });

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
        ...tokens,
      };
    } catch (err: any) {
      if (err instanceof ConflictException || err instanceof BadRequestException) throw err;
      this.logger.error(`Registration failed: ${err.message}`, err.stack);
      if (err.code === 'P2002') {
        throw new ConflictException('An account with this email already exists');
      }
      if (err.code === 'P1000' || err.code === 'P1001' || err.message?.includes('connect')) {
        throw new BadRequestException('Service temporarily unavailable. Please try again later.');
      }
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new UnauthorizedException('No account found with this email');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('This account has been deactivated. Please contact support.');
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException('Incorrect password. Please try again.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
        ...tokens,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error(`Login failed: ${err.message}`, err.stack);
      if (err.code === 'P1000' || err.code === 'P1001' || err.message?.includes('connect')) {
        throw new BadRequestException('Service temporarily unavailable. Please try again later.');
      }
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (storedToken.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        throw new UnauthorizedException('Refresh token has expired. Please log in again.');
      }

      const user = await this.prisma.user.findUnique({ where: { id: storedToken.userId } });
      if (!user || !user.isActive) throw new UnauthorizedException('User not found or deactivated');

      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error(`Token refresh failed: ${err.message}`, err.stack);
      throw new UnauthorizedException('Failed to refresh session. Please log in again.');
    }
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
  }

  private async generateTokens(userId: string, email: string | null, role: string) {
    const payload = { sub: userId, email: email ?? '', role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }
}
