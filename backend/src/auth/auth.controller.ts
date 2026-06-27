import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { successResponse } from '../common/response.util';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const result = await this.authService.register(dto.email, dto.password, dto.displayName, dto.phone);
      return successResponse(result, 'Registration successful');
    } catch (err: any) {
      this.logger.error(`Register endpoint error: ${err.message}`);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        { message: 'Registration failed', error: err.message || 'Unknown error' },
        err.status || 500,
      );
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    try {
      const result = await this.authService.login(dto.email, dto.password);
      return successResponse(result, 'Login successful');
    } catch (err: any) {
      this.logger.error(`Login endpoint error: ${err.message}`);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        { message: 'Login failed', error: err.message || 'Unknown error' },
        err.status || 500,
      );
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto) {
    try {
      const result = await this.authService.refreshTokens(dto.refreshToken);
      return successResponse(result, 'Tokens refreshed');
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        { message: 'Token refresh failed', error: err.message || 'Unknown error' },
        err.status || 500,
      );
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
    return successResponse(null, 'Logged out');
  }
}
