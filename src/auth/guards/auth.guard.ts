import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { I18nService } from 'nestjs-i18n';
import { SessionType } from '@prisma/client';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    const sessionData = await this.sessionService.validateToken(token);
    if (!sessionData) {
      throw new UnauthorizedException('Invalid token');
    }

    const path = request.path.toLowerCase();

    if (path.startsWith('/products')) {
      if (sessionData.type !== SessionType.ADMIN) {
        throw new UnauthorizedException('Only admins can access products');
      }
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
