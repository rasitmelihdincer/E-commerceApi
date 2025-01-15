import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionType } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Roles(SessionType.CUSTOMER)
  @ApiOperation({ summary: 'Get all orders for the customer' })
  @ApiResponse({ status: 200, description: 'Returns all orders' })
  async list() {
    return await this.orderService.getOrders();
  }

  @Post()
  @Roles(SessionType.CUSTOMER)
  @ApiOperation({ summary: 'Create a new order from cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(@Req() req, @Body() dto: CreateOrderDto) {
    return await this.orderService.createOrder(req.session.customerId, dto);
  }

  @Get(':id')
  @Roles(SessionType.CUSTOMER)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the order' })
  async getOrderById(@Req() req, @Param('id') id: string) {
    return await this.orderService.getOrderById(req.session.customerId, +id);
  }

  @Patch(':id/status')
  @Roles(SessionType.CUSTOMER)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateOrderStatus(
    @Req() req,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return await this.orderService.updateOrderStatus(
      req.session.customerId,
      +id,
      status,
    );
  }
}
