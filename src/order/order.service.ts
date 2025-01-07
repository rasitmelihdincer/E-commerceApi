// src/orders/order.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderRepository } from './order.repository';
import { CartRepository } from 'src/cart/cart.repository';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  async createOrder(
    customerId: number,
    dto: CreateOrderDto,
  ): Promise<OrderEntity> {
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

  async getOrders(customerId: number): Promise<OrderEntity[]> {
    return this.orderRepository.findAll(customerId);
  }

  async updateOrderStatus(
    customerId: number,
    orderId: number,
    status: string,
  ): Promise<OrderEntity> {
    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      customerId,
      status,
    );
    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }
    return updatedOrder;
  }
}
