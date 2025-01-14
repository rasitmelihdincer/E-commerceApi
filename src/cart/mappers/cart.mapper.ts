import { CartEntity } from '../entities/cart.entity';
import { Cart, CartItem } from '@prisma/client';
import { CartItemMapper } from './cart-item.mapper';
import { CartResponseDto } from '../dto/cart-response.dto';

export class CartMapper {
  static toEntity(cart: Cart & { cartItems: CartItem[] }): CartEntity {
    const entity = new CartEntity();
    entity.id = cart.id;
    entity.customerId = cart.customerId;
    entity.addressId = cart.addressId;
    entity.createdAt = cart.createdAt;
    entity.updatedAt = cart.updatedAt;
    entity.cartItems = cart.cartItems.map(CartItemMapper.toEntity);
    return entity;
  }

  static toDto(entity: CartEntity): CartResponseDto {
    return {
      id: entity.id,
      customerId: entity.customerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      productCount: entity.productCount,
      totalPrice: entity.totalPrice,
      cartItems: entity.cartItems.map(CartItemMapper.toDto),
    };
  }
}
