import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CartMapper } from './mappers/cart.mapper';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CartItemMapper } from './mappers/cart-item.mapper';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly i18n: I18nService,
  ) {}

  messageCartNotFound = this.i18n.translate('test.CART_NOTFOUND');
  messageCartItemNotFound = this.i18n.translate('test.CART_ITEM_NOTFOUND');
  async list(customerId: number): Promise<CartResponseDto[]> {
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
      throw new NotFoundException(this.messageCartNotFound);
    }
    const cart = await this.cartRepository.findCartById(cartItem.cartId);
    if (!cart || cart.customerId !== customerId) {
      throw new NotFoundException(this.messageCartNotFound);
    }

    const updated = await this.cartRepository.updateCartItem(id, dto);
    return CartItemMapper.toDto(updated);
  }

  async deleteCartItem(customerId: number, id: number) {
    const cartItem = await this.cartRepository.findCartItemById(id);
    if (!cartItem) {
      throw new NotFoundException(this.messageCartItemNotFound);
    }
    const cart = await this.cartRepository.findCartById(cartItem.cartId);
    if (!cart || cart.customerId !== customerId) {
      throw new NotFoundException(this.messageCartNotFound);
    }
    await this.cartRepository.deleteCartItem(id);
  }

  async listCartItems(
    customerId: number,
    cartId: number,
  ): Promise<CartItemResponseDto[]> {
    const cart = await this.cartRepository.findCartById(cartId);
    if (!cart || cart.customerId !== customerId) {
      throw new NotFoundException(this.messageCartNotFound);
    }
    return cart.cartItems.map(CartItemMapper.toDto);
  }
}
