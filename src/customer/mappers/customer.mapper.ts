import { Injectable } from "@nestjs/common";
import { Customer } from "@prisma/client";
import { CustomerEntity } from "../entities/customer.entity";
import { CustomerDTO } from "../dto/customer.dto";
import { plainToInstance } from 'class-transformer';
 
@Injectable()
export class CustomerMapper {

    public toEntity(customer : Customer) : CustomerEntity{
        return new CustomerEntity(
            customer.id,
            customer.firstName,
            customer.lastName,
            customer.email,
            customer.hashedPassword,
            customer.createAt,
            customer.updatedAt,
        );
    }

    public toDto(entity : CustomerEntity) : CustomerDTO{
        return plainToInstance(CustomerDTO, entity);
    }
}
