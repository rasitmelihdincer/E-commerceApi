import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomerDTO } from './dto/customer.dto';
import { CustomerRepository } from './customer.repository';
import { CustomerMapper } from './mappers/customer.mapper';
import { Customer, Prisma } from '@prisma/client';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerMapper: CustomerMapper,
  ) {}

  async list(): Promise<CustomerDTO[]> {
    const entities = await this.customerRepository.list();
    return entities.map(CustomerMapper.toDto);
  }
  async create(dto: CreateCustomerDto): Promise<CustomerDTO> {
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
    const entity = await this.customerRepository.create(createInput);
    return CustomerMapper.toDto(entity);
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<CustomerDTO> {
    const existing = await this.customerRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    let hashedPassword = existing.hashedPassword;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const updateForRepo: UpdateCustomerDto = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
    };

    const updatedEntity = await this.customerRepository.update(
      id,
      updateForRepo,
    );
    return CustomerMapper.toDto(updatedEntity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.customerRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }
    await this.customerRepository.delete(id);
  }

  async show(id: number): Promise<CustomerDTO> {
    const existing = await this.customerRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }
    return CustomerMapper.toDto(existing);
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findByEmail(email);
  }
}
