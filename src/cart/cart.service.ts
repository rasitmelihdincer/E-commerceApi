import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CartMapper } from './mappers/cart.mapper';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CartItemMapper } from './mappers/cart-item.mapper';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async list(customerId: number): Promise<any[]> {
    const carts = await this.cartRepository.listCartsByCustomerId(customerId);
    return carts.map(CartMapper.toDto);
  }

  async addCartItem(customerId: number, dto: CreateCartItemDto) {
    let cart = await this.cartRepository.findCartByCustomerId(customerId);
    if (!cart) {
      cart = await this.cartRepository.createCart(customerId);
    }
    const cartItem = await this.cartRepository.addCartItem(cart.id, dto);
    return CartItemMapper.toDto(cartItem);
  }

  async updateCartItem(customerId: number, id: number, dto: UpdateCartItemDto) {
    const cartItem = await this.cartRepository.findCartItemById(id);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    const cart = await this.cartRepository.findCartById(cartItem.cartId);
    if (!cart || cart.customerId !== customerId) {
      throw new NotFoundException('Cart not found or not yours');
    }

    const updated = await this.cartRepository.updateCartItem(id, dto);
    return CartItemMapper.toDto(updated);
  }

  async deleteCartItem(customerId: number, id: number) {
    const cartItem = await this.cartRepository.findCartItemById(id);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    const cart = await this.cartRepository.findCartById(cartItem.cartId);
    if (!cart || cart.customerId !== customerId) {
      throw new NotFoundException('Cart not found or not yours');
    }
    await this.cartRepository.deleteCartItem(id);
  }

  async listCartItems(customerId: number, cartId: number): Promise<any[]> {
    const cart = await this.cartRepository.findCartById(cartId);
    if (!cart || cart.customerId !== customerId) {
      throw new NotFoundException('Cart not found or not yours');
    }
    return cart.cartItems.map(CartItemMapper.toDto);
  }
}
