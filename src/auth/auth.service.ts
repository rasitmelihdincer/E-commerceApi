import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { CustomerService } from 'src/customer/customer.service';
import { AdminService } from 'src/admin/admin.service';
import { SessionService } from './session/session.service';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { SessionType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly adminService: AdminService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
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
      const payload = this.jwtService.verify(token);
      if (!payload.sessionId) {
        throw new UnauthorizedException('Invalid token');
      }

      await this.sessionService.deleteSession(payload.sessionId);
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateToken(token: string, type: SessionType) {
    const sessionData = await this.sessionService.validateToken(token);
    if (!sessionData || sessionData.type !== type) {
      return null;
    }
    return sessionData;
  }

  async customerRegister(registerDto: RegisterDto) {
    const existingCustomer = await this.customerService.findByEmail(
      registerDto.email,
    );
    if (existingCustomer) {
      throw new ConflictException('Email already exists');
    }

    const customer = await this.customerService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
    });

    return {
      message: 'Customer registered successfully',
      data: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
    };
  }

  async adminRegister(registerDto: RegisterDto) {
    const existingAdmin = await this.adminService.findByEmail(
      registerDto.email,
    );
    if (existingAdmin) {
      throw new ConflictException('Email already exists');
    }

    const admin = await this.adminService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
    });

    return {
      message: 'Admin registered successfully',
      data: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
      },
    };
  }
}
