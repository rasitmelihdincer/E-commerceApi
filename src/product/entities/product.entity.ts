export class ProductEntity {
  id: number;
  productName: string;
  productDescription: string;
  productCategoryId: number | null;
  productStock: number;
  createAt: Date;
  updatedAt: Date;
}
