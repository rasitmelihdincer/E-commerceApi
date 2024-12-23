import { CartItemResponseDto } from './cart-item-response.dto';

export class CartResponseDto {
  id: number;
  customerId: number;
  addressId: number;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
  totalPrice: number;
  cartItems: CartItemResponseDto[];
}
