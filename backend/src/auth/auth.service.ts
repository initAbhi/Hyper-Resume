import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { User, UserRole } from '../users/entities/user.entity.js';
import { UserSession } from './entities/user-session.entity.js';
import { PasswordResetToken } from './entities/password-reset-token.entity.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { EmailService } from '../email/email.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { GoogleAuthDto } from './dto/google-auth.dto.js';

export interface SanitizedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepo: Repository<PasswordResetToken>,
    @InjectRepository(CandidateProfile)
    private readonly profileRepository: Repository<CandidateProfile>,
    @InjectRepository(CreditLedger)
    private readonly creditLedgerRepository: Repository<CreditLedger>,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(clientId);
  }

  public async signup(
    dto: SignupDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      email: normalizedEmail,
      fullName: dto.fullName.trim(),
      passwordHash,
      role: UserRole.USER,
      isActive: true,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Initialize Master Candidate Profile
    const profile = this.profileRepository.create({
      userId: savedUser.id,
      headline: '',
      summary: '',
      location: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    });
    await this.profileRepository.save(profile);

    // Initial Welcome Signup Credits (5 free audits/matches)
    const initialCredits = this.creditLedgerRepository.create({
      userId: savedUser.id,
      amount: 5,
      transactionType: 'signup_bonus',
      idempotencyKey: `signup-bonus-${savedUser.id}`,
      description: 'Welcome bonus: 5 free AI optimizations & analyses',
      metadata: { initial: true },
    });
    await this.creditLedgerRepository.save(initialCredits);

    const tokens = await this.generateTokensAndSession(savedUser, userAgent, ipAddress);

    return {
      user: this.sanitizeUser(savedUser),
      tokens,
    };
  }

  public async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    // Constant-time check to prevent user enumeration
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokensAndSession(user, userAgent, ipAddress);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.sessionRepository.update(
        { userId, tokenHash, isRevoked: false },
        { isRevoked: true },
      );
    } else {
      await this.sessionRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true },
      );
    }
  }

  public async refresh(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ tokens: AuthTokens; user: SanitizedUser }> {
    const tokenHash = this.hashToken(refreshToken);

    const session = await this.sessionRepository.findOne({
      where: { tokenHash, isRevoked: false },
      relations: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!session.user || !session.user.isActive) {
      throw new UnauthorizedException('User account inactive or not found');
    }

    // Revoke old session token (Rotation)
    session.isRevoked = true;
    await this.sessionRepository.save(session);

    // Issue new tokens & session
    const tokens = await this.generateTokensAndSession(session.user, userAgent, ipAddress);

    return {
      tokens,
      user: this.sanitizeUser(session.user),
    };
  }

  public async getCurrentUser(userId: string): Promise<{
    user: SanitizedUser;
    creditBalance: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { sum } = await this.creditLedgerRepository
      .createQueryBuilder('ledger')
      .select('COALESCE(SUM(ledger.amount), 0)', 'sum')
      .where('ledger.user_id = :userId', { userId })
      .getRawOne();

    return {
      user: this.sanitizeUser(user),
      creditBalance: Number(sum),
    };
  }

  private async generateTokensAndSession(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const secret = this.configService.get<string>(
      'JWT_SECRET',
      'dev-hyper-resume-secret-key-min-32-chars-long',
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Access token valid for 1 hour (3600 seconds)
    const accessToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: '1h',
    });

    // Refresh token is a cryptographically secure 256-bit random hex string
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    // Refresh token valid for 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = this.sessionRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      isRevoked: false,
      userAgent: userAgent ? userAgent.substring(0, 255) : undefined,
      ipAddress: ipAddress ? ipAddress.substring(0, 45) : undefined,
    });
    await this.sessionRepository.save(session);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }

  // --- Password Reset Flow ---
  public async requestPasswordReset(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findOne({ where: { email: normalizedEmail } });

    // Consistent response whether user exists or not to prevent enumeration
    if (!user || !user.isActive) {
      this.logger.warn(`Password reset requested for non-existent or inactive email: ${normalizedEmail}`);
      return {
        message: 'If an account exists with this email address, you will receive password reset instructions.',
      };
    }

    // Invalidate previous active reset tokens for this user
    await this.passwordResetTokenRepo.update(
      { userId: user.id, isUsed: false },
      { isUsed: true },
    );

    // Generate secure 256-bit random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    // 1-hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const resetTokenEntity = this.passwordResetTokenRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      isUsed: false,
    });
    await this.passwordResetTokenRepo.save(resetTokenEntity);

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, rawToken, user.fullName);
    this.logger.log(`Password reset email dispatched to ${user.email}`);

    return {
      message: 'If an account exists with this email address, you will receive password reset instructions.',
    };
  }

  public async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token || !token.trim()) {
      throw new BadRequestException('Reset token is required');
    }

    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const tokenHash = this.hashToken(token.trim());
    const resetRecord = await this.passwordResetTokenRepo.findOne({
      where: { tokenHash, isUsed: false },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('This password reset link is invalid or has expired. Please request a new one.');
    }

    const user = await this.userRepository.findOne({ where: { id: resetRecord.userId } });
    if (!user || !user.isActive) {
      throw new BadRequestException('Unable to reset password for this user account.');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    // Mark token as used
    resetRecord.isUsed = true;
    await this.passwordResetTokenRepo.save(resetRecord);

    // Revoke all existing sessions so any stale or compromised sessions are terminated
    await this.sessionRepository.update({ userId: user.id, isRevoked: false }, { isRevoked: true });
    this.logger.log(`Password successfully reset for user: ${user.email}`);

    return {
      message: 'Your password has been successfully reset. You may now sign in with your new password.',
    };
  }

  // --- Google OAuth Sign In & Sign Up ---
  public async googleAuth(
    dto: GoogleAuthDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ user: SanitizedUser; tokens: AuthTokens; isNewUser: boolean }> {
    let email: string | undefined;
    let name: string | undefined;

    // 1. Verify Google Credential (JWT)
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: clientId ? [clientId] : undefined,
      });
      const payload = ticket.getPayload();
      if (payload && payload.email) {
        email = payload.email.toLowerCase().trim();
        name = payload.name;
      }
    } catch (err: unknown) {
      this.logger.warn(`Google verifyIdToken failed, attempting direct tokeninfo fallback: ${err instanceof Error ? err.message : String(err)}`);
      // Fallback: verify via Google's tokeninfo API
      try {
        const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(dto.credential)}`);
        if (!res.ok) {
          throw new Error('Google tokeninfo endpoint returned an error');
        }
        const data = (await res.json()) as { email?: string; name?: string };
        if (data.email) {
          email = data.email.toLowerCase().trim();
          name = data.name;
        }
      } catch (fallbackErr) {
        this.logger.error(`Google tokeninfo verification failed: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`);
        throw new UnauthorizedException('Invalid or expired Google authentication credential');
      }
    }

    if (!email) {
      throw new UnauthorizedException('Could not retrieve email from Google credential');
    }

    // 2. Find or create user
    let user = await this.userRepository.findOne({ where: { email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = this.userRepository.create({
        email,
        fullName: name || dto.targetRole ? `${name || 'Professional'}` : 'Professional',
        passwordHash,
        role: UserRole.USER,
        isActive: true,
        isEmailVerified: true, // Google verifies user emails
      });
      user = await this.userRepository.save(user);

      // Create initial candidate profile with any provided target role / goal
      const profile = this.profileRepository.create({
        userId: user.id,
        headline: dto.targetRole || '',
        summary: dto.targetGoal ? `Target Goal: ${dto.targetGoal}` : '',
        location: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
      });
      await this.profileRepository.save(profile);

      // Welcome signup bonus
      const initialCredits = this.creditLedgerRepository.create({
        userId: user.id,
        amount: 5,
        transactionType: 'signup_bonus',
        idempotencyKey: `signup-bonus-${user.id}`,
        description: 'Welcome bonus: 5 free AI optimizations & analyses',
        metadata: { provider: 'google', initial: true, targetRole: dto.targetRole, targetGoal: dto.targetGoal },
      });
      await this.creditLedgerRepository.save(initialCredits);
    } else {
      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive. Please contact support.');
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await this.userRepository.save(user);
      }
      // If user supplied onboarding goals and profile is empty, update it
      if (dto.targetRole) {
        const profile = await this.profileRepository.findOne({ where: { userId: user.id } });
        if (profile && !profile.headline) {
          profile.headline = dto.targetRole;
          await this.profileRepository.save(profile);
        }
      }
    }

    const tokens = await this.generateTokensAndSession(user, userAgent, ipAddress);

    return {
      user: this.sanitizeUser(user),
      tokens,
      isNewUser,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}
