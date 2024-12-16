export class ProductEntity {
  constructor(
    public id: number,
    public productName: string,
    public productDescription: string,
    public productCategory: string,
    public productStock: number,
    public createAt: Date,
  ) {}
}
