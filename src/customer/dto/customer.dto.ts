import { AddressDTO } from 'src/address/dto/address.dto';

export class CustomerDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createAt: Date;
  updatedAt: Date;
  address: AddressDTO[];
}
