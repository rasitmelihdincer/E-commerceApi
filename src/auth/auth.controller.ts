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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateCustomerDto) {
    const user = await this.authService.register(dto);
    return {
      message: 'User registered successfully',
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
    if (!authorization) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token found in authorization header');
    }

    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }
}
