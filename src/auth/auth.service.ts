import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CustomerService } from 'src/customer/customer.service';
import { AdminService } from 'src/admin/admin.service';
import { SessionService } from './session/session.service';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { SessionType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly adminService: AdminService,
    private readonly sessionService: SessionService,
  ) {}

  async customerLogin(loginDto: LoginDto) {
    const customer = await this.customerService.findByEmail(loginDto.email);
    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(
      loginDto.password,
      customer.hashedPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.sessionService.createCustomerSession(customer.id);

    const { hashedPassword, ...customerData } = customer;

    return {
      access_token: token,
      user: customerData,
    };
  }

  async adminLogin(loginDto: LoginDto) {
    const admin = await this.adminService['adminRepository'].findByEmail(
      loginDto.email,
    );
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(
      loginDto.password,
      admin.hashedPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.sessionService.createAdminSession(admin.id);

    const adminDto = await this.adminService.findByEmail(loginDto.email);

    return {
      access_token: token,
      user: adminDto,
    };
  }

  async logout(token: string, type: SessionType) {
    try {
      await this.sessionService.deleteSession(token);
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateToken(token: string, type: SessionType) {
    return this.sessionService.validateToken(token);
  }
}
