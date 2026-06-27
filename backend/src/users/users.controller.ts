import { Controller, Get, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { successResponse } from '../common/response.util';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    return successResponse(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() body: { displayName?: string; avatarUrl?: string }) {
    const user = await this.usersService.updateProfile(req.user.id, body);
    return successResponse(user, 'Profile updated');
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.usersService.findAll(page, limit);
    return successResponse(result);
  }
}
