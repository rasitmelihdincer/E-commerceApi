import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session/session.service';
import { CustomerRepository } from 'src/customer/customer.repository';
import * as bcrypt from 'bcryptjs';
import { CustomerService } from 'src/customer/customer.service';
import { CreateCustomerDto } from 'src/customer/dto/create-customer.dto';
import { CustomerDTO } from 'src/customer/dto/customer.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly sessionService: SessionService,
    private readonly i18n: I18nService,
  ) {}

  async register(dto: CreateCustomerDto): Promise<CustomerDTO> {
    return this.customerService.create(dto);
  }

  async login(email: string, password: string): Promise<string> {
    const customer = await this.customerService.findByEmail(email);
    const message = await this.i18n.translate('test.INVALID_CREDENTIALS');
    if (!customer) throw new UnauthorizedException(message);

    const isMatch = await bcrypt.compare(password, customer.hashedPassword);
    if (!isMatch) throw new UnauthorizedException(message);

    const token = await this.sessionService.createSession(customer.id);
    return token;
  }

  async logout(token: string): Promise<void> {
    await this.sessionService.deleteSession(token);
  }
}
