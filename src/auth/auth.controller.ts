import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateCustomerDto } from 'src/customer/dto/create-customer.dto';
import { I18nService } from 'nestjs-i18n';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateCustomerDto) {
    const user = await this.authService.register(dto);
    const message = await this.i18n.translate('test.USER_REGISTERED');
    return {
      message: message,
      user,
    };
  }

  @Post('login')
  async login(@Body() { email, password }: LoginDto) {
    const token = await this.authService.login(email, password);
    return { access_token: token };
  }

  @Post('logout')
  async logout(@Headers('authorization') authorization: string) {
    const message = await this.i18n.translate('test.LOGGED_OUT');
    const messageNoAuth = await this.i18n.translate('test.NO_AUTH_HEADER');
    const messageNoToken = await this.i18n.translate('test.NO_TOKEN');
    if (!authorization) {
      throw new UnauthorizedException(messageNoAuth);
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(messageNoToken);
    }

    await this.authService.logout(token);
    return { message: message };
  }
}
