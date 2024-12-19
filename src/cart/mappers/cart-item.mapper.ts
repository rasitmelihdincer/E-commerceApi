import { CartItemEntity } from '../entities/cart-item.entity';
import { CartItem } from '@prisma/client';

export class CartItemMapper {
  static toEntity(cartItem: CartItem): CartItemEntity {
    const entity = new CartItemEntity();
    entity.id = cartItem.id;
    entity.cartId = cartItem.cartId;
    entity.productId = cartItem.productId;
    entity.quantity = cartItem.quantity;
    entity.createdAt = cartItem.createdAt;
    return entity;
  }

  static toDto(entity: CartItemEntity): any {
    return {
      id: entity.id,
      cartId: entity.cartId,
      productId: entity.productId,
      quantity: entity.quantity,
      createdAt: entity.createdAt,
    };
  }
}
