import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CustomerDTO } from "./dto/customer.dto";
import { CustomerRepository } from "./customer.repository";
import { CustomerMapper } from "./mappers/customer.mapper";
import { Customer, Prisma } from "@prisma/client";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CustomerEntity } from "./entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
    constructor(    
        private readonly customerRepository: CustomerRepository,
        private readonly customerMapper: CustomerMapper,
    ){}

    async list(): Promise<CustomerDTO[]> {
        const customers = await this.customerRepository.list();
        const entities = customers.map((c) => this.customerMapper.toEntity(c));
        return entities.map((e) => this.customerMapper.toDto(e));
    }

    async create(dto : CreateCustomerDto) : Promise<CustomerDTO> {
        const existing = await this.customerRepository.findByEmail(dto.email);
        if (existing) {
            throw new BadRequestException('Bu email adresi zaten kayıtlı');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const createInput = {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          hashedPassword: hashedPassword,
        };
        const created = await this.customerRepository.create(createInput);
        const entity = this.customerMapper.toEntity(created);
        return this.customerMapper.toDto(entity);
    }

    async update(id : number, dto : UpdateCustomerDto) : Promise<CustomerDTO> {
        const existing = await this.customerRepository.findById(id);
        if (!existing) {
          throw new NotFoundException('Customer not found');
        }
    
        let hashedPassword = existing.hashedPassword;
        if (dto.password) {
          hashedPassword = await bcrypt.hash(dto.password, 10);
        }
    
        const updateInput: Prisma.CustomerUpdateInput = {};
        if (dto.firstName !== undefined) updateInput.firstName = dto.firstName;
        if (dto.lastName !== undefined) updateInput.lastName = dto.lastName;
        if (dto.email !== undefined) updateInput.email = dto.email;
        updateInput.hashedPassword = hashedPassword;
        updateInput.updatedAt = new Date();
    
        const updated = await this.customerRepository.update(id, updateInput);
        const entity = this.customerMapper.toEntity(updated);
        return this.customerMapper.toDto(entity);
    }

    async delete(id : number) : Promise<void> {
        const existing = await this.customerRepository.findById(id);
        if (!existing) {
          throw new NotFoundException('Customer not found');
        }
        await this.customerRepository.delete(id);
    }

    async show(id : number) : Promise<CustomerDTO> {
        const existing = await this.customerRepository.findById(id);
        if (!existing) {
          throw new NotFoundException('Customer not found');
        }
        const entity = this.customerMapper.toEntity(existing);
        return this.customerMapper.toDto(entity);
    }

    async findByEmail(email: string) : Promise<CustomerEntity | null>{
      const customer = await this.customerRepository.findByEmail(email);
      if (!customer) return null;
      const entity = this.customerMapper.toEntity(customer);
      return entity;
    }
}