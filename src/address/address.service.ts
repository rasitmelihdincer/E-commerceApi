import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressRepository } from './address.repository';
import { AddressMapper } from './mappers/address.mapper';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressDTO } from './dto/address.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AddressService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly i18n: I18nService,
  ) {}

  async list(): Promise<AddressDTO[]> {
    const addresses = await this.addressRepository.list();
    return addresses.map(AddressMapper.toDto);
  }

  async create(customerId: number, dto: CreateAddressDto) {
    const entity = await this.addressRepository.create(customerId, dto);
    return AddressMapper.toDto(entity);
  }

  async update(id: number, customerId: number, dto: UpdateAddressDto) {
    const existing = await this.addressRepository.update(id, dto);
    const message = await this.i18n.translate('test.ADDRESS_NOTFOUND');
    if (!existing || existing.customerId !== customerId) {
      throw new NotFoundException(message);
    }
    const updated = await this.addressRepository.update(id, dto);
    return AddressMapper.toDto(updated);
  }

  async delete(id: number, customerId: number) {
    const existing = await this.addressRepository.findById(id);
    const message = await this.i18n.translate('test.ADDRESS_NOTFOUND');

    if (!existing || existing.customerId !== customerId) {
      throw new NotFoundException(message);
    }
    await this.addressRepository.delete(id);
  }

  async listByCustomerId(customerId: number): Promise<AddressDTO[]> {
    const addresses = await this.addressRepository.listByCustomerId(customerId);
    return addresses.map(AddressMapper.toDto);
  }
}
