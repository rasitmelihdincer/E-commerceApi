// src/orders/repositories/order.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { OrderEntity } from './entities/order.entity';
import { CartItemEntity } from 'src/cart/entities/cart-item.entity';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    customerId: number,
    addressId: number,
    cartItems: CartItemEntity[],
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
          status: OrderStatus.PENDING,
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

  async update(
    orderId: number,
    data: {
      status?: OrderStatus;
      addressId?: number;
      totalPrice?: number;
    },
  ): Promise<OrderEntity> {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        orderItems: true,
      },
    });
    return this.mapToEntity(updatedOrder);
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

  async findAll(): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.mapToEntity(order));
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
