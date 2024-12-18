import { AddressEntity } from 'src/address/entities/address.entity';

export class CustomerEntity {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public email: string,
    public hashedPassword: string,
    public createAt: Date,
    public updateAt: Date,
    public addresses?: AddressEntity[],
  ) {}
}
