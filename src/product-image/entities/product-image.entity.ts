export class ProductImageEntity {
  constructor(
    public id: number,
    public imageUrl: string,
    public productId: number,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
