import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'no-secret-configured',
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }
      return { id: user.id, email: user.email, role: user.role, displayName: user.displayName };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.warn(`JWT validation failed: ${err.message}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
