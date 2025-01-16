// src/orders/order.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderRepository } from './order.repository';
import { CartRepository } from 'src/cart/cart.repository';
import { OrderEntity } from './entities/order.entity';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(
    customerId: number,
    dto: CreateOrderDto,
  ): Promise<OrderEntity> {
    const address = await this.prisma.address.findFirst({
      where: {
        id: dto.addressId,
        customerId: customerId,
      },
    });

    if (!address) {
      throw new ForbiddenException(
        'Invalid address or address does not belong to customer',
      );
    }

    // Aktif sepeti kontrol et
    const cart = await this.cartRepository.findCartByCustomerId(customerId);
    if (!cart) {
      throw new NotFoundException('Active cart not found');
    }

    // Sepette ürün var mı kontrol et
    if (!cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Siparişi oluştur
    return this.orderRepository.create(
      customerId,
      dto.addressId,
      cart.cartItems,
    );
  }

  async updateOrder(
    orderId: number,
    data: {
      status?: OrderStatus;
      addressId?: number;
      totalPrice?: number;
    },
  ): Promise<OrderEntity> {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return this.orderRepository.update(orderId, data);
  }

  async getOrderById(
    customerId: number,
    orderId: number,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(orderId, customerId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getOrders(): Promise<OrderEntity[]> {
    return this.orderRepository.findAll();
  }
}
