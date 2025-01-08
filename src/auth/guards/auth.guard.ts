import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionService } from '../session/session.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SessionType } from '@prisma/client';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    const sessionData = await this.sessionService.validateToken(token);
    if (!sessionData) {
      throw new UnauthorizedException('Invalid token');
    }

    const requiredRoles = this.reflector.getAllAndOverride<SessionType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && !requiredRoles.includes(sessionData.type)) {
      throw new UnauthorizedException(
        `This endpoint requires one of these roles: ${requiredRoles.join(', ')}`,
      );
    }

    request.session = sessionData;
    return true;
  }

  private extractToken(request: any): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No auth header');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token found');
    }
    return token;
  }
}
