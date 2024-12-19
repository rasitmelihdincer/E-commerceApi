import { Injectable, NotFoundException } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressEntity } from './entities/address.entity';
import { AddressMapper } from './mappers/address.mapper';

@Injectable()
export class AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    customerId: number,
    dto: CreateAddressDto,
  ): Promise<AddressEntity> {
    const created = await this.prisma.address.create({
      data: {
        customer: { connect: { id: customerId } },
        country: dto.city,
        city: dto.city,
        district: dto.district,
        street: dto.street,
        postcode: dto.postcode,
      },
    });

    return AddressMapper.toEntity(created);
  }

  async findById(id: number): Promise<AddressEntity | null> {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) return null;
    return AddressMapper.toEntity(address);
  }

  async update(id: number, dto: UpdateAddressDto): Promise<AddressEntity> {
    const existing = await this.prisma.address.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Address not found`);
    }

    const data: Prisma.AddressUpdateInput = {};
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.district !== undefined) data.district = dto.district;
    if (dto.street !== undefined) data.street = dto.street;
    if (dto.postcode !== undefined) data.postcode = dto.postcode;

    const updated = await this.prisma.address.update({
      where: { id },
      data,
    });
    return AddressMapper.toEntity(updated); // DB tipi -> Entity
  }

  async delete(id: number): Promise<void> {
    await this.prisma.address.delete({ where: { id } });
  }

  async listByCustomerId(customerId: number): Promise<AddressEntity[]> {
    const addresses = await this.prisma.address.findMany({
      where: { customerId },
    });
    return addresses.map(AddressMapper.toEntity);
  }
}
