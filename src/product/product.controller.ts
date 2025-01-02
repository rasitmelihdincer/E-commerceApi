import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get product list' })
  @ApiResponse({ status: 200, description: 'Success' })
  async list() {
    return await this.productService.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(@Body() dto: CreateProductDto) {
    const createdProduct = await this.productService.create(dto);
    return {
      message: 'Product created successfully',
      data: createdProduct,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update existing product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const updatedProduct = await this.productService.update(+id, dto);
    const message = await this.i18n.translate('test.PRODUCT_UPDATED');
    return {
      message: message,
      updatedProduct,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async delete(@Param('id') id: string) {
    const deletedProduct = await this.productService.delete(+id);
    const message = await this.i18n.translate('test.PRODUCT_DELETED');
    return {
      message: message,
      content: deletedProduct,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product' })
  @ApiResponse({ status: 200, description: 'Product details' })
  async get(@Param('id') id: string) {
    return this.productService.getById(+id);
  }
}
