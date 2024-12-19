import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-auth-token'];

    /*
    test@test ---------> 72839d76-9f8b-4452-9296-f76106d61670
    mevlut@mevlut.com ----------> 3cec6f34-2cac-463b-a1b6-10286582b177
    */

    if (!token) {
      throw new UnauthorizedException('No auth token provided');
    }

    const customerId = await this.sessionService.validateToken(token);
    if (!customerId) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = { id: customerId };
    return true;
  }
}
