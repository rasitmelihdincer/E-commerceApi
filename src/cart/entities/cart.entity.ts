import { CartItemEntity } from './cart-item.entity';

export class CartEntity {
  id: number;
  customerId: number;
  addressId: number;
  createdAt: Date;
  updatedAt: Date;
  cartItems: CartItemEntity[];

  get productCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalPrice(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  }
}
