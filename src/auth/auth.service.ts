import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CustomerService } from 'src/customer/customer.service';
import { SessionService } from './session/session.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.customerService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      const { hashedPassword, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.sessionService.createSession(user.id);

    return {
      access_token: token,
      user,
    };
  }

  async logout(token: string) {
    try {
      // Token'ı doğrula ve kullanıcı ID'sini al
      const payload = this.jwtService.verify(token);

      // Session'ı Redis'ten sil
      await this.sessionService.deleteSession(token);

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateToken(token: string): Promise<number | null> {
    return this.sessionService.validateToken(token);
  }
}
