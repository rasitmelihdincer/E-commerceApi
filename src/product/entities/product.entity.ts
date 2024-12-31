export class ProductEntity {
  id: number;
  productName: string;
  productDescription: string;
  productCategoryId: number | null;
  productStock: number;
  price: number;
  images?: ProductImageEntity[];
  createAt: Date;
  updatedAt: Date;
}
export class ProductImageEntity {
  id: number;
  imageUrl: string;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
}
