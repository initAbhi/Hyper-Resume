import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UserRole } from '../users/entities/user.entity.js';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockSessionRepo: any;
  let mockPasswordResetTokenRepo: any;
  let mockProfileRepo: any;
  let mockCreditLedgerRepo: any;
  let mockEmailService: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockUserRepo = {
      findOne: vi.fn(),
      create: vi.fn((data) => ({ id: 'usr-123', ...data, createdAt: new Date() })),
      save: vi.fn((data) => Promise.resolve({ id: 'usr-123', ...data, createdAt: new Date() })),
    };

    mockSessionRepo = {
      create: vi.fn((data) => ({ id: 'sess-123', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'sess-123', ...data })),
      findOne: vi.fn(),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockPasswordResetTokenRepo = {
      create: vi.fn((data) => ({ id: 'prt-123', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'prt-123', ...data })),
      findOne: vi.fn(),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockProfileRepo = {
      create: vi.fn((data) => ({ id: 'prof-123', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'prof-123', ...data })),
      findOne: vi.fn(),
    };

    mockCreditLedgerRepo = {
      create: vi.fn((data) => ({ id: 'cred-123', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'cred-123', ...data })),
      createQueryBuilder: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({ sum: '5' }),
      })),
    };

    mockEmailService = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'msg-123' }),
      sendVerificationEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'msg-123' }),
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('jwt-access-token-xyz'),
    };

    mockConfigService = {
      get: vi.fn((key: string, defaultVal?: any) => {
        if (key === 'JWT_SECRET') return 'test-jwt-secret-key-min-32-chars-long';
        return defaultVal;
      }),
    };

    authService = new AuthService(
      mockUserRepo,
      mockSessionRepo,
      mockPasswordResetTokenRepo,
      mockProfileRepo,
      mockCreditLedgerRepo,
      mockEmailService,
      mockJwtService,
      mockConfigService,
    );
  });

  describe('signup', () => {
    it('should create user, hash password, award welcome credits, and return tokens', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await authService.signup({
        email: 'NEW_USER@hyperresume.io',
        password: 'SecurePassword123!',
        fullName: 'Jane Doe',
      });

      expect(result.user.email).toBe('new_user@hyperresume.io');
      expect(result.user.fullName).toBe('Jane Doe');
      expect(result.tokens.accessToken).toBe('jwt-access-token-xyz');
      expect(result.tokens.refreshToken).toBeDefined();

      // Verified welcome bonus was awarded
      expect(mockCreditLedgerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr-123',
          amount: 5,
          transactionType: 'signup_bonus',
        }),
      );

      // Verified candidate profile was initialized
      expect(mockProfileRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr-123',
        }),
      );
    });

    it('should throw ConflictException if email already registered', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing-id', email: 'existing@hyperresume.io' });

      await expect(
        authService.signup({
          email: 'existing@hyperresume.io',
          password: 'Password123!',
          fullName: 'Duplicate User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException on invalid credentials with generic message', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@hyperresume.io',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject inactive user accounts', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-inactive',
        email: 'inactive@hyperresume.io',
        passwordHash: '$2a$10$xyz',
        isActive: false,
      });

      await expect(
        authService.login({
          email: 'inactive@hyperresume.io',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should reject expired or revoked refresh tokens', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);

      await expect(
        authService.refresh('invalid-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should rotate session and return new tokens when valid', async () => {
      const mockSession = {
        id: 'sess-1',
        userId: 'usr-1',
        tokenHash: 'somehash',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        user: {
          id: 'usr-1',
          email: 'test@hyperresume.io',
          fullName: 'Test User',
          role: UserRole.USER,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
        },
      };

      mockSessionRepo.findOne.mockResolvedValue(mockSession);

      const result = await authService.refresh('valid-refresh-token');

      expect(mockSession.isRevoked).toBe(true);
      expect(result.tokens.accessToken).toBe('jwt-access-token-xyz');
      expect(result.user.id).toBe('usr-1');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token and dispatch email if user exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'usr-1',
        email: 'user@example.com',
        fullName: 'John Doe',
        isActive: true,
      });

      const res = await authService.requestPasswordReset('user@example.com');
      expect(res.message).toContain('password reset instructions');
      expect(mockPasswordResetTokenRepo.create).toHaveBeenCalled();
      expect(mockPasswordResetTokenRepo.save).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.any(String),
        'John Doe',
      );
    });

    it('should return benign message if user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const res = await authService.requestPasswordReset('nonexistent@example.com');
      expect(res.message).toContain('password reset instructions');
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should update user password and mark token used', async () => {
      mockPasswordResetTokenRepo.findOne.mockResolvedValue({
        id: 'prt-1',
        userId: 'usr-1',
        isUsed: false,
        expiresAt: new Date(Date.now() + 100000),
      });

      mockUserRepo.findOne.mockResolvedValue({
        id: 'usr-1',
        email: 'user@example.com',
        isActive: true,
        passwordHash: 'old-hash',
      });

      const res = await authService.resetPassword('sample-token', 'NewSecurePassword123!');
      expect(res.message).toContain('successfully reset');
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockPasswordResetTokenRepo.save).toHaveBeenCalled();
      expect(mockSessionRepo.update).toHaveBeenCalled();
    });
  });
});
