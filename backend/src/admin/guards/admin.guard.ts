import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity.js';
import { RequestContext } from '../../common/logger/request-context.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'dev-hyper-resume-secret-key-min-32-chars-long',
      );
      const payload = await this.jwtService.verifyAsync(token, { secret });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User account inactive or not found');
      }

      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Administrator access required');
      }

      request.user = user;
      RequestContext.setUserId(user.id);
      return true;
    } catch (err: unknown) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }
    if (request?.cookies?.hr_access_token && typeof request.cookies.hr_access_token === 'string') {
      return request.cookies.hr_access_token;
    }
    return null;
  }
}
