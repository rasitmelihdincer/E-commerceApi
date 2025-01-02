import { ProductImageEntity } from 'src/product-image/entities/product-image.entity';

export class ProductEntity {
  id: number;
  productName: string;
  productDescription: string;
  productCategoryId: number | null;
  productStock: number;
  price: number;
  createAt: Date;
  updatedAt: Date;
  images?: ProductImageEntity[];
}
