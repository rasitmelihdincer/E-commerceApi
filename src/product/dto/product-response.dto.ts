import { ProductImageEntity } from '../entities/product.entity';

export class ProductResponseDto {
  id: number;
  productName: string;
  productDescription: string;
  imageUrl?: string | null;
  productCategoryId: number | null;
  productStock: number;
  price: number;
  images?: ProductImageEntity[];
  createAt: Date;
  updatedAt: Date;
}
