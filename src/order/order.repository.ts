// src/orders/repositories/order.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    customerId: number,
    addressId: number,
    cartItems: any[],
  ): Promise<OrderEntity> {
    // Toplam fiyatı hesapla
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    // Transaction başlat
    return this.prisma.$transaction(async (tx) => {
      // Order oluştur
      const order = await tx.order.create({
        data: {
          customerId,
          addressId,
          status: 'PENDING',
          totalPrice,
        },
      });

      // Order items oluştur
      const orderItemsData = cartItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // Cart'ı temizle
      const cart = await tx.cart.findFirst({
        where: { customerId },
      });

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      // Güncel order'ı getir
      const updatedOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          orderItems: true,
        },
      });

      return this.mapToEntity(updatedOrder);
    });
  }

  async findById(id: number, customerId: number): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        customerId,
      },
      include: {
        orderItems: true,
      },
    });

    return order ? this.mapToEntity(order) : null;
  }

  async findAll(customerId: number): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        customerId,
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.mapToEntity(order));
  }

  async updateStatus(
    orderId: number,
    customerId: number,
    status: string,
  ): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        customerId,
      },
    });

    if (!order) {
      return null;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: true,
      },
    });

    return this.mapToEntity(updatedOrder);
  }

  private mapToEntity(order: any): OrderEntity {
    return {
      id: order.id,
      customerId: order.customerId,
      addressId: order.addressId,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: order.orderItems?.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }
}
