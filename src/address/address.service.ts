import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressRepository } from './address.repository';
import { AddressMapper } from './mappers/address.mapper';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressDTO } from './dto/address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async create(customerId: number, dto: CreateAddressDto) {
    const entity = await this.addressRepository.create(customerId, dto);
    return AddressMapper.toDto(entity);
  }

  async update(id: number, customerId: number, dto: UpdateAddressDto) {
    const existing = await this.addressRepository.update(id, dto);
    if (!existing || existing.customerId !== customerId) {
      throw new NotFoundException('Address not found or not yours');
    }
    const updated = await this.addressRepository.update(id, dto);
    return AddressMapper.toDto(updated);
  }

  async delete(id: number, customerId: number) {
    const existing = await this.addressRepository.findById(id);

    if (!existing || existing.customerId !== customerId) {
      throw new NotFoundException('Address not found or not yours');
    }
    await this.addressRepository.delete(id);
  }

  async list(customerId: number): Promise<AddressDTO[]> {
    const addresses = await this.addressRepository.listByCustomerId(customerId);
    return addresses.map(AddressMapper.toDto);
  }
}
