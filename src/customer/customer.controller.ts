import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomerDTO } from './dto/customer.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { SessionType } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(AuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all customers (Admin) or current customer (Customer)',
  })
  @ApiResponse({ status: 200, type: [CustomerDTO] })
  async list(@Req() req) {
    if (req.session.type === SessionType.ADMIN) {
      return {
        data: await this.customerService.list(),
      };
    } else {
      const customer = await this.customerService.findById(
        req.session.customerId,
      );
      return {
        data: [customer],
      };
    }
  }

  @Post()
  @Roles(SessionType.ADMIN)
  @ApiOperation({ summary: 'Create a new customer (Admin only)' })
  @ApiResponse({ status: 201, type: CustomerDTO })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only admins can create customers',
  })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return {
      message: 'Customer created successfully',
      data: await this.customerService.create(createCustomerDto),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, type: CustomerDTO })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    if (
      req.session.type !== SessionType.ADMIN &&
      req.session.customerId !== id
    ) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return {
      data: await this.customerService.findById(id),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, type: CustomerDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Req() req,
  ) {
    if (
      req.session.type !== SessionType.ADMIN &&
      req.session.customerId !== id
    ) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return {
      message: 'Customer updated successfully',
      data: await this.customerService.update(id, updateCustomerDto),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 200 })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // Sadece admin müşteri silebilir
    if (req.session.type !== SessionType.ADMIN) {
      throw new ForbiddenException('Only admins can delete customers');
    }

    await this.customerService.delete(id);
    return {
      message: 'Customer deleted successfully',
    };
  }
}
