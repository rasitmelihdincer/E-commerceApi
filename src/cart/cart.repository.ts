import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CartEntity } from './entities/cart.entity';
import { CartMapper } from './mappers/cart.mapper';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CartItemEntity } from './entities/cart-item.entity';
import { CartItemMapper } from './mappers/cart-item.mapper';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCart(
    customerId: number,
    addressId?: number,
  ): Promise<CartEntity> {
    const created = await this.prisma.cart.create({
      data: {
        customer: { connect: { id: customerId } },
        addressId: addressId || 1,
      },
      include: { cartItems: true },
    });

    return CartMapper.toEntity(created);
  }

  async findCartByCustomerId(customerId: number): Promise<CartEntity | null> {
    const cart = await this.prisma.cart.findFirst({
      where: { customerId },
      include: {
        cartItems: {
          include: { product: true },
        },
      },
    });
    if (!cart) return null;
    return CartMapper.toEntity(cart);
  }

  async findCartId(id: number): Promise<CartEntity | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: { cartItems: true },
    });

    if (!cart) return null;
    return CartMapper.toEntity(cart);
  }
  async findCartById(id: number): Promise<CartEntity | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: {
        cartItems: {
          include: { product: true },
        },
      },
    });
    if (!cart) return null;
    return CartMapper.toEntity(cart);
  }

  async listCartsByCustomerId(customerId: number): Promise<CartEntity[]> {
    const carts = await this.prisma.cart.findMany({
      where: { customerId },
      include: {
        cartItems: {
          include: { product: true },
        },
      },
    });
    return carts.map(CartMapper.toEntity);
  }

  async addCartItem(
    cartId: number,
    dto: CreateCartItemDto,
  ): Promise<CartItemEntity> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    if (product.productStock < dto.quantity) {
      throw new NotFoundException(`Product out of stock`);
    }
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId, productId: dto.productId },
      include: { product: true },
    });

    let updatedItem;
    if (existingItem) {
      updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
        include: { product: true },
      });
      return CartItemMapper.toEntity(updatedItem);
    } else {
      const created = await this.prisma.cartItem.create({
        data: {
          cart: { connect: { id: cartId } },
          product: { connect: { id: dto.productId } },
          quantity: dto.quantity,
        },
        include: { product: true },
      });
      return CartItemMapper.toEntity(created);
    }
  }

  async updateCartItem(
    id: number,
    dto: UpdateCartItemDto,
  ): Promise<CartItemEntity> {
    const existing = await this.prisma.cartItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Cart item not found`);
    }

    const updated = await this.prisma.cartItem.update({
      where: { id },
      data: {
        quantity: dto.quantity || existing.quantity,
      },
    });

    return CartItemMapper.toEntity(updated);
  }

  async deleteCartItem(id: number): Promise<void> {
    await this.prisma.cartItem.delete({ where: { id } });
  }

  async findCartItemById(id: number): Promise<CartItemEntity | null> {
    const item = await this.prisma.cartItem.findUnique({ where: { id } });
    if (!item) return null;
    return CartItemMapper.toEntity(item);
  }
}
