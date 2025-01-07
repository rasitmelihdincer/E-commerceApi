// src/orders/order.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionType } from '@prisma/client';

@ApiTags('Orders')
@UseGuards(AuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order from cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Req() req, @Body() dto: CreateOrderDto) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can create orders');
    }
    return await this.orderService.createOrder(req.session.customerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the customer' })
  @ApiResponse({ status: 200, description: 'Returns all orders' })
  async getOrders(@Req() req) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can view orders');
    }
    return await this.orderService.getOrders(req.session.customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the order' })
  async getOrderById(@Req() req, @Param('id') id: string) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can view orders');
    }
    return await this.orderService.getOrderById(req.session.customerId, +id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateOrderStatus(
    @Req() req,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    if (req.session.type !== SessionType.CUSTOMER || !req.session.customerId) {
      throw new UnauthorizedException('Only customers can update orders');
    }
    return await this.orderService.updateOrderStatus(
      req.session.customerId,
      +id,
      status,
    );
  }
}
