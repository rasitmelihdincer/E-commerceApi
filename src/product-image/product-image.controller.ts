import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductImageService } from './product-image.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { ProductImageResponseDto } from './dto/product-image-response.dto';

@ApiTags('Product Images')
@Controller('/products/:productId/images')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a product image' })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: ProductImageResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const productId = req.params.productId;
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `product-${productId}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadImage(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const image = await this.productImageService.create(
      productId,
      file.filename,
    );
    return {
      message: 'Image uploaded successfully',
      data: image,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all images of a product' })
  @ApiResponse({
    status: 200,
    description: 'Returns all images of the product',
    type: [ProductImageResponseDto],
  })
  async findByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return {
      data: await this.productImageService.findByProductId(productId),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.productImageService.delete(id);
    return {
      message: 'Image deleted successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product image' })
  @ApiResponse({
    status: 200,
    description: 'Returns the product image',
    type: ProductImageResponseDto,
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      data: await this.productImageService.findById(id),
    };
  }
}
