import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomerDTO } from './dto/customer.dto';
import { CustomerRepository } from './customer.repository';
import { CustomerMapper } from './mappers/customer.mapper';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import * as bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerMapper: CustomerMapper,
    private readonly i18n: I18nService,
  ) {}

  async list(): Promise<CustomerDTO[]> {
    const entities = await this.customerRepository.list();
    return entities.map(CustomerMapper.toDto);
  }
  async create(dto: CreateCustomerDto): Promise<CustomerDTO> {
    const existing = await this.customerRepository.findByEmail(dto.email);
    if (existing) {
      const message = this.i18n.translate('test.DUPLICATE_EMAIL');
      throw new BadRequestException(message);
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
      const message = await this.i18n.translate('test.CUSTOMER_NOT_FOUND');
      throw new NotFoundException(message);
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
      const message = await this.i18n.translate('test.CUSTOMER_NOT_FOUND');
      throw new NotFoundException(message);
    }
    await this.customerRepository.delete(id);
  }

  async show(id: number): Promise<CustomerDTO> {
    const existing = await this.customerRepository.findById(id);
    const message = await this.i18n.translate('test.CUSTOMER_NOT_FOUND');
    if (!existing) {
      throw new NotFoundException(message);
    }
    return CustomerMapper.toDto(existing);
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findByEmail(email);
  }

  async findById(id: number): Promise<CustomerDTO> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return CustomerMapper.toDto(customer);
  }
}
