import { CartItemEntity } from '../entities/cart-item.entity';
import { Cart, CartItem, Product } from '@prisma/client';
import { ProductResponseDto } from 'src/product/dto/product-response.dto';
import { ProductEntity } from 'src/product/entities/product.entity';
import { CartItemResponseDto } from '../dto/cart-item-response.dto';

export class CartItemMapper {
  static toEntity(cartItem: CartItem & { product?: Product }): CartItemEntity {
    const entity = new CartItemEntity();
    entity.id = cartItem.id;
    entity.cartId = cartItem.cartId;
    entity.productId = cartItem.productId;
    entity.quantity = cartItem.quantity;
    entity.createdAt = cartItem.createdAt;

    if (cartItem.product) {
      const productEntity = new ProductEntity();
      productEntity.id = cartItem.product.id;
      productEntity.productName = cartItem.product.productName;
      productEntity.productDescription = cartItem.product.productDescription;
      productEntity.productCategoryId = cartItem.product.productCategoryId;
      productEntity.productStock = cartItem.product.productStock;
      productEntity.price = Number(cartItem.product.price);
      productEntity.createAt = cartItem.product.createAt;
      productEntity.updatedAt = cartItem.product.updatedAt;

      entity.product = productEntity;
    }

    return entity;
  }

  static toDto(entity: CartItemEntity): CartItemResponseDto {
    return {
      id: entity.id,
      cartId: entity.cartId,
      productId: entity.productId,
      quantity: entity.quantity,
      createdAt: entity.createdAt,
      product: entity.product
        ? {
            id: entity.product.id,
            productName: entity.product.productName,
            productDescription: entity.product.productDescription,
            productCategoryId: entity.product.productCategoryId,
            productStock: entity.product.productStock,
            price: entity.product.price,
            createAt: entity.product.createAt,
            updatedAt: entity.product.updatedAt,
          }
        : null,
    };
  }
}
