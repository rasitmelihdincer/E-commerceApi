import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartMapper } from './mappers/cart.mapper';
import { CartItemMapper } from './mappers/cart-item.mapper';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async list(customerId: number) {
    const cart = await this.cartRepository.findCartByCustomerId(customerId);
    return cart ? CartMapper.toDto(cart) : [];
  }

  async addCartItem(customerId: number, dto: CreateCartItemDto) {
    let cart = await this.cartRepository.findCartByCustomerId(customerId);
    if (!cart) {
      cart = await this.cartRepository.createCart(customerId);
    }

    const cartItem = await this.cartRepository.addCartItem(cart.id, dto);
    return CartItemMapper.toDto(cartItem);
  }

  async updateCartItem(
    customerId: number,
    itemId: number,
    dto: UpdateCartItemDto,
  ) {
    const cartItem = await this.cartRepository.findCartItemById(itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const cart = await this.cartRepository.findCartByCustomerId(customerId);
    if (!cart || cart.id !== cartItem.cartId) {
      throw new NotFoundException('Cart item not found');
    }

    const updated = await this.cartRepository.updateCartItem(itemId, dto);
    return CartItemMapper.toDto(updated);
  }

  async deleteCartItem(customerId: number, itemId: number) {
    // Önce cart item'ın bu kullanıcıya ait olduğunu kontrol et
    const cartItem = await this.cartRepository.findCartItemById(itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const cart = await this.cartRepository.findCartByCustomerId(customerId);
    if (!cart || cart.id !== cartItem.cartId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.deleteCartItem(itemId);
  }

  async listCartItems(customerId: number, cartId: number) {
    // Önce cart'ın bu kullanıcıya ait olduğunu kontrol et
    const cart = await this.cartRepository.findCartByCustomerId(customerId);
    if (!cart || cart.id !== cartId) {
      throw new NotFoundException('Cart not found');
    }

    const items = await this.cartRepository.listCartItems(cartId);
    return items.map((item) => CartItemMapper.toDto(item));
  }
}
