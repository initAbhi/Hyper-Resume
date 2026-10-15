import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { User, UserRole } from '../users/entities/user.entity.js';
import { UserSession } from './entities/user-session.entity.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';

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
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(CandidateProfile)
    private readonly profileRepository: Repository<CandidateProfile>,
    @InjectRepository(CreditLedger)
    private readonly creditLedgerRepository: Repository<CreditLedger>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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
