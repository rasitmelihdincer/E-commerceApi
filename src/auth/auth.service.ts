import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session/session.service';
import { CustomerRepository } from 'src/customer/customer.repository';
import * as bcrypt from 'bcrypt';
import { CustomerService } from 'src/customer/customer.service';
import { CreateCustomerDto } from 'src/customer/dto/create-customer.dto';
import { CustomerDTO } from 'src/customer/dto/customer.dto';

@Injectable()
export class AuthService {
    constructor(
    private readonly customerService: CustomerService, 
    private readonly sessionService : SessionService){}

    async register(dto: CreateCustomerDto) : Promise<CustomerDTO>{
        return this.customerService.create(dto);
    }

    async login(email: string, password: string) : Promise<string>{
        const customer =await this.customerService.findByEmail(email);
        if(!customer) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(password, customer.hashedPassword);
        if(!isMatch) throw new UnauthorizedException('Invalid credentials');
        
        const token = await this.sessionService.createSession(customer.id);
        return token;
    }

    async logout(token : string) : Promise<void>{
        await this.sessionService.deleteSession(token);
    }


}
