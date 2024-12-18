import { Address } from '@prisma/client';
import { AddressEntity } from '../entities/address.entity';
import { AddressDTO } from 'src/address/dto/address.dto';

export class AddressMapper {
  static toEntity(address: Address): AddressEntity {
    return new AddressEntity(
      address.id,
      address.customerId,
      address.country,
      address.city,
      address.district,
      address.street,
      address.postcode,
      new Date(address.createAt),
      new Date(address.updatedAt),
    );
  }

  static toDto(entity: AddressEntity): AddressDTO {
    return {
      id: entity.id,
      customerId: entity.customerId,
      country: entity.country,
      city: entity.city,
      district: entity.district,
      street: entity.street,
      postcode: entity.postcode,
      createAt: entity.createAt,
      updatedAt: entity.updateAt,
    };
  }
}
