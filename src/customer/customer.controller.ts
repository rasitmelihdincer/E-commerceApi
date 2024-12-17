import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
//customer
@Controller('customers')
export class CustomerController {
  constructor(public customerService: CustomerService) {}

  @Get()
  async list() {
    return this.customerService.list();
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    const create = await this.customerService.create(dto);
    return {
      message: 'Customer Created Successfully',
      customer: create,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const update = await this.customerService.update(+id, dto);
    return {
      message: 'Customer Updated Successfully',
      customer: update,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.customerService.delete(+id);
    return {
      message: 'Customer Deleted Successfully',
    };
  }

 

  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile(@Req() req) {
    return { message: 'Protected route', userId: req.user.id };
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    console.log('Show', id);
    return await this.customerService.show(+id);
  }


}
