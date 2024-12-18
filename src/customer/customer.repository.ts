import { Injectable } from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CustomerEntity } from './entities/customer.entity';
import { CustomerMapper } from './mappers/customer.mapper';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<CustomerEntity[]> {
    const customers = await this.prisma.customer.findMany({
      include: {
        addresses: true,
      },
    });

    return customers.map(CustomerMapper.toEntity);
  }

  async create(data: Prisma.CustomerCreateInput): Promise<CustomerEntity> {
    const created = await this.prisma.customer.create({
      data,
      include: { addresses: true },
    });
    return CustomerMapper.toEntity(created);
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<CustomerEntity> {
    const data: Prisma.CustomerUpdateInput = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.email !== undefined) data.email = dto.email;

    data.updatedAt = new Date();

    const updated = await this.prisma.customer.update({
      where: { id },
      data,
      include: { addresses: true },
    });
    return CustomerMapper.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.customer.delete({
      where: { id },
    });
  }

  async findById(id: number): Promise<CustomerEntity | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { addresses: true },
    });
    if (!customer) return null;
    return CustomerMapper.toEntity(customer);
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
      include: { addresses: true },
    });
    if (!customer) return null;
    return CustomerMapper.toEntity(customer);
  }
}
