import { ProductResponseDto } from 'src/product/dto/product-response.dto';

export class CartItemResponseDto {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  product?: ProductResponseDto | null;
}
