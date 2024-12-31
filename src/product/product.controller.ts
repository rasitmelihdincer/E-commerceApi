import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'; // <-- Önemli: multer'dan import
import { extname } from 'path';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
// import { Express } from 'express'; // Gerekirse

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly i18n: I18nService,
  ) {}

  // 1) ÜRÜN LİSTELEME
  @Get()
  @ApiOperation({ summary: 'Ürün listesini getir' })
  @ApiResponse({
    status: 200,
    description: 'Başarılı',
  })
  async list() {
    return await this.productService.list();
  }

  // Çoklu resim yükleyerek ürün oluşturma
  @Post('multi')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname); // ".png", ".jpg" vs.
          const fileName = file.fieldname + '-' + uniqueSuffix + ext;
          callback(null, fileName);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Çoklu resim ve ürün bilgisi birlikte gönderilir',
    schema: {
      type: 'object',
      properties: {
        productName: { type: 'string' },
        productDescription: { type: 'string' },
        productCategoryId: { type: 'number' },
        productStock: { type: 'number' },
        price: { type: 'number' },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Yeni ürün (çoklu resim ile) oluştur' })
  @ApiResponse({
    status: 201,
    description: 'Ürün resimleriyle birlikte oluşturuldu.',
  })
  async createProductWithMultipleImages(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Dosya yoksa da hata vermek yerine, "[]" olarak kabul edebilirsiniz
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

    // Yüklenmiş dosyaların URL’lerini oluştur
    const imageUrls = files.map(
      (file) => `${serverUrl}/uploads/${file.filename}`,
    );

    // Servis katmanına pasla
    const createdProduct = await this.productService.createWithImages(
      dto,
      imageUrls,
    );

    return {
      message: 'Ürün ve resimler başarıyla oluşturuldu',
      data: createdProduct,
    };
  }

  // 3) ÜRÜN GÜNCELLEME
  @Patch(':id')
  @ApiOperation({ summary: 'Mevcut ürünü güncelle' })
  @ApiResponse({ status: 200, description: 'Ürün başarıyla güncellendi.' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const updatedProduct = await this.productService.update(+id, dto);
    const message = await this.i18n.translate('test.PRODUCT_UPDATED');
    return {
      message: message,
      updatedProduct,
    };
  }

  // 4) ÜRÜN SİLME
  @Delete(':id')
  @ApiOperation({ summary: 'Ürünü sil' })
  @ApiResponse({ status: 200, description: 'Ürün başarıyla silindi.' })
  async delete(@Param('id') id: string) {
    const deletedProduct = await this.productService.delete(+id);
    const message = await this.i18n.translate('test.PRODUCT_DELETED');
    return {
      message: message,
      content: deletedProduct,
    };
  }

  // 5) TEK ÜRÜN DETAY
  @Get(':id')
  @ApiOperation({ summary: 'Belirli bir ürünü getir' })
  @ApiResponse({ status: 200, description: 'Ürün detayları.' })
  async get(@Param('id') id: string) {
    return this.productService.getById(+id);
  }
}
