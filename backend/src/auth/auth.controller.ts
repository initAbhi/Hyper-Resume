import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() dto: SignupDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const result = await this.authService.signup(dto, userAgent, ip);
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const result = await this.authService.login(dto, userAgent, ip);
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: User,
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refreshToken || req.cookies?.hr_refresh_token;
    await this.authService.logout(user.id, refreshToken);
    this.clearAuthCookies(res);

    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refreshToken || req.cookies?.hr_refresh_token;
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const result = await this.authService.refresh(refreshToken, userAgent, ip);
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return this.authService.getCurrentUser(user.id);
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('hr_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 * 1000, // 1 hour
    });

    res.cookie('hr_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600 * 1000, // 7 days
    });
  }

  private clearAuthCookies(res: Response): void {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    res.clearCookie('hr_access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('hr_refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
  }
}
