export class AddressEntity {
  constructor(
    public id: number,
    public customerId: number,
    public country: string,
    public city: string,
    public district: string,
    public street: string,
    public postcode: string,
    public createAt: Date,
    public updateAt: Date,
  ) {}
}
