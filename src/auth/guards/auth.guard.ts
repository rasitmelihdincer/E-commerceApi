import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;
    const messageNoAuth = await this.i18n.translate('test.NO_AUTH_HEADER');
    const messageNoToken = await this.i18n.translate('test.NO_TOKEN');
    const messageInvalidToken = await this.i18n.translate('test.INVALID_TOKEN');

    if (!authorizationHeader) {
      throw new UnauthorizedException(messageNoToken);
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(messageNoAuth);
    }

    const customerId = await this.sessionService.validateToken(token);
    if (!customerId) {
      throw new UnauthorizedException(messageInvalidToken);
    }

    request.user = { id: customerId };
    return true;
  }
}
