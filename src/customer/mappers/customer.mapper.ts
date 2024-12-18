import { Injectable } from '@nestjs/common';
import { Address, Customer } from '@prisma/client';
import { CustomerEntity } from '../entities/customer.entity';
import { CustomerDTO } from '../dto/customer.dto';
import { plainToInstance } from 'class-transformer';
import { AddressEntity } from 'src/address/entities/address.entity';
import { AddressDTO } from 'src/address/dto/address.dto';
import { AddressMapper } from 'src/address/mappers/address.mapper';

@Injectable()
export class CustomerMapper {
  static toEntity(
    customer: Customer & { addresses?: Address[] },
  ): CustomerEntity {
    const addressEntities: AddressEntity[] = (customer.addresses ?? []).map(
      (addr) => {
        return new AddressEntity(
          addr.id,
          addr.customerId,
          addr.country,
          addr.city,
          addr.district,
          addr.street,
          addr.postcode,
          addr.createAt,
          addr.updatedAt,
        );
      },
    );

    return new CustomerEntity(
      customer.id,
      customer.firstName,
      customer.lastName,
      customer.email,
      customer.hashedPassword,
      customer.createAt,
      customer.updatedAt,
      addressEntities,
    );
  }

  static toDto(entity: CustomerEntity): CustomerDTO {
    const addressDTOs: AddressDTO[] = entity.addresses.map((a) =>
      AddressMapper.toDto(a),
    );
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      createAt: entity.createAt,
      updatedAt: entity.updateAt,
      address: addressDTOs,
    };
  }
}
