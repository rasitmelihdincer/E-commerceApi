import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { CartMapper } from './mappers/cart.mapper';
import { CartItemMapper } from './mappers/cart-item.mapper';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCartByCustomerId(customerId: number): Promise<CartEntity | null> {
    const cart = await this.prisma.cart.findFirst({
      where: { customerId },
      include: {
        cartItems: {
          include: { product: true },
        },
      },
    });
    return cart ? CartMapper.toEntity(cart) : null;
  }

  async createCart(customerId: number): Promise<CartEntity> {
    const cart = await this.prisma.cart.create({
      data: {
        customer: { connect: { id: customerId } },
        addressId: 1,
      },
      include: {
        cartItems: {
          include: { product: true },
        },
      },
    });
    return CartMapper.toEntity(cart);
  }

  async addCartItem(
    cartId: number,
    dto: CreateCartItemDto,
  ): Promise<CartItemEntity> {
    // Önce ürünü kontrol et
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Stok kontrolü
    if (product.productStock < dto.quantity) {
      throw new BadRequestException(
        `Not enough stock for product #${dto.productId}. Available: ${product.productStock}, Requested: ${dto.quantity}`,
      );
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId,
        productId: dto.productId,
      },
      include: { product: true },
    });

    if (existingItem) {
      // Toplam miktar stoktan fazla olmamalı
      const totalQuantity = existingItem.quantity + dto.quantity;
      if (totalQuantity > product.productStock) {
        throw new BadRequestException(
          `Cannot add ${dto.quantity} more items. Current cart quantity: ${existingItem.quantity}, Available stock: ${product.productStock}`,
        );
      }

      // Varsa miktarı güncelle
      const updated = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: totalQuantity },
        include: { product: true },
      });
      return CartItemMapper.toEntity(updated);
    }

    // Yoksa yeni oluştur
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

  async updateCartItem(
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartItemEntity> {
    // Önce cart item'ı ve ürünü kontrol et
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item #${itemId} not found`);
    }

    // Stok kontrolü
    if (cartItem.product.productStock < dto.quantity) {
      throw new BadRequestException(
        `Not enough stock for product #${cartItem.productId}. Available: ${cartItem.product.productStock}, Requested: ${dto.quantity}`,
      );
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: { product: true },
    });
    return CartItemMapper.toEntity(updated);
  }

  async findCartItemById(id: number): Promise<CartItemEntity | null> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id },
      include: { product: true },
    });
    return item ? CartItemMapper.toEntity(item) : null;
  }

  async deleteCartItem(id: number): Promise<void> {
    const existing = await this.prisma.cartItem.findUnique({
      where: { id },
    });
    if (!existing) {
      return;
    }
    await this.prisma.cartItem.delete({
      where: { id },
    });
  }

  async listCartItems(cartId: number): Promise<CartItemEntity[]> {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: { product: true },
    });
    return items.map((item) => CartItemMapper.toEntity(item));
  }
}
