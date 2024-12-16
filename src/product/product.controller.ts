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

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async list() {
    return await this.productService.list();
  }

  // add diye eklemeye gerek yok rest standartlarina aykiri
  // @Post('/add')
  @Post()
  async create(@Body() body: any) {
    const createdProduct = await this.productService.create(body);
    return {
      message: 'Ürün başarılı bir şekilde eklendi',
      createdProduct,
    };
  }

  //!
  // @Patch('update/:id')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    // try {
    //   } catch (error) {
    //     if (error instanceof NotFoundException) {
    //       return {
    //         message: `Ürün ID ${id} bulunamadı.`,
    //       };
    //     }
    //     throw error;
    //   }
    const updatedProduct = await this.productService.update(+id, body);
    return {
      message: 'Ürün Başarılı bir şekilde güncellendi',
      updatedProduct,
    };
  }

  //! @Delete('delete/:id')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedProduct = await this.productService.delete(+id);
    return {
      message: 'Ürün başarılı bir şekilde silindi',
      content: deletedProduct,
    };

  }

  @Get('/stocks')
  async getStocks() {
    return await this.productService.getStocks();
  }
}
