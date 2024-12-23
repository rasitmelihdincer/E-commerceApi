import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { dot } from 'node:test/reporters';
import { UpdateProductDto } from './dto/update-product.dto';
import { I18nService, I18nValidationExceptionFilter } from 'nestjs-i18n';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async list() {
    return await this.productService.list();
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const createdProduct = await this.productService.create(dto);
    const message = await this.i18n.translate('test.PRODUCT_ADDED');
    return {
      message: message,
      createdProduct,
    };
  }

  //!
  // @Patch('update/:id')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const updatedProduct = await this.productService.update(+id, dto);
    const message = await this.i18n.translate('test.PRODUCT_UPDATED');
    return {
      message: message,
      updatedProduct,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedProduct = await this.productService.delete(+id);
    const message = await this.i18n.translate('test.PRODUCT_DELETED');
    return {
      message: message,
      content: deletedProduct,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.productService.getById(+id);
  }
}
