import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { GoogleAuthDto } from './dto/google-auth.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { createPublicRateLimiter } from '../common/utils/public-rate-limit.util.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('auth')
export class AuthController {
  private readonly enforceSignupLimit = createPublicRateLimiter(10, 15 * 60 * 1000);
  private readonly enforceLoginLimit = createPublicRateLimiter(20, 15 * 60 * 1000);
  private readonly enforceForgotLimit = createPublicRateLimiter(5, 15 * 60 * 1000);
  private readonly enforceResetLimit = createPublicRateLimiter(10, 15 * 60 * 1000);
  private readonly enforceVerifyLimit = createPublicRateLimiter(10, 15 * 60 * 1000);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private shouldApplyRateLimit(): boolean {
    return this.configService.get<string>('NODE_ENV') !== 'test' && process.env.NODE_ENV !== 'test';
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() dto: SignupDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (this.shouldApplyRateLimit()) {
      this.enforceSignupLimit(req);
    }
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
    if (this.shouldApplyRateLimit()) {
      this.enforceLoginLimit(req);
    }
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
      throw new UnauthorizedException('Refresh token is required');
    }

    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const result = await this.authService.refresh(refreshToken, userAgent, ip);
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    if (this.shouldApplyRateLimit()) {
      this.enforceForgotLimit(req);
    }
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    if (this.shouldApplyRateLimit()) {
      this.enforceResetLimit(req);
    }
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { token?: string }, @Req() req: Request) {
    if (this.shouldApplyRateLimit()) {
      this.enforceVerifyLimit(req);
    }
    if (!body?.token || typeof body.token !== 'string') {
      throw new BadRequestException('Verification token is required');
    }
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resendVerification(@CurrentUser() user: User, @Req() req: Request) {
    if (this.shouldApplyRateLimit()) {
      this.enforceVerifyLimit(req);
    }
    return this.authService.resendVerificationEmail(user.id);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Body() dto: GoogleAuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const result = await this.authService.googleAuth(dto, userAgent, ip);
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return this.authService.getCurrentUser(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(
    @CurrentUser() user: User,
    @Body() body: { fullName?: string },
  ) {
    if (body?.fullName !== undefined && typeof body.fullName !== 'string') {
      throw new BadRequestException('fullName must be a string');
    }
    return this.authService.updateCurrentUser(user.id, { fullName: body?.fullName });
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async listSessions(@CurrentUser() user: User) {
    return { sessions: await this.authService.listSessions(user.id) };
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser() user: User,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    return this.authService.revokeSession(user.id, sessionId);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.revokeAllSessions(user.id);
    this.clearAuthCookies(res);
    return result;
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: User,
    @Body() body: { currentPassword?: string; newPassword?: string },
  ) {
    if (typeof body?.currentPassword !== 'string' || !body.currentPassword.trim()) {
      throw new BadRequestException('Current password is required');
    }
    if (typeof body?.newPassword !== 'string' || body.newPassword.length < 8 || body.newPassword.length > 128) {
      throw new BadRequestException('New password must be between 8 and 128 characters');
    }
    return this.authService.changePassword(
      user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.deleteAccount(user.id);
    this.clearAuthCookies(res);
    return result;
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const expiresInStr =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
      this.configService.get<string>('JWT_EXPIRATION') ||
      '7d';
    const accessMaxAgeMs = this.authService.parseDurationToMs(expiresInStr);

    res.cookie('hr_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: accessMaxAgeMs,
    });

    res.cookie('hr_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 3600 * 1000, // 30 days
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
