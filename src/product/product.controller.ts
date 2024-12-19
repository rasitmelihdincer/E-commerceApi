import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { dot } from 'node:test/reporters';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async list() {
    return await this.productService.list();
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const createdProduct = await this.productService.create(dto);
    return {
      message: 'Ürün başarılı bir şekilde eklendi',
      createdProduct,
    };
  }

  //!
  // @Patch('update/:id')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const updatedProduct = await this.productService.update(+id, dto);
    return {
      message: 'Ürün Başarılı bir şekilde güncellendi',
      updatedProduct,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedProduct = await this.productService.delete(+id);
    return {
      message: 'Ürün başarılı bir şekilde silindi',
      content: deletedProduct,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.productService.getById(+id);
  }
}
