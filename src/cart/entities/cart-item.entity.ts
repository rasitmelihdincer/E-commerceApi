import { ProductEntity } from 'src/product/entities/product.entity';

export class CartItemEntity {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  product: ProductEntity;
}
