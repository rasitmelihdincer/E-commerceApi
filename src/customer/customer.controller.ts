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
import { I18nService } from 'nestjs-i18n';
//customer
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async list() {
    return this.customerService.list();
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    const create = await this.customerService.create(dto);
    const message = await this.i18n.translate('test.CUSTOMER_CREATED');
    return {
      message: message,
      customer: create,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const update = await this.customerService.update(+id, dto);
    const message = await this.i18n.translate('test.CUSTOMER_UPDATED');
    return {
      message: message,
      customer: update,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.customerService.delete(+id);
    const message = await this.i18n.translate('test.CUSTOMER_DELETED');
    return {
      message: message,
    };
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile(@Req() req) {
    return { message: 'Protected route', userId: req.user.id };
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    return await this.customerService.show(+id);
  }
}
