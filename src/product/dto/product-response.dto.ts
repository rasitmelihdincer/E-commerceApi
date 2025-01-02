import { ApiProperty } from '@nestjs/swagger';
import { ProductImageResponseDto } from 'src/product-image/dto/product-image-response.dto';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'iPhone 12' })
  productName: string;

  @ApiProperty({ example: 'A great smartphone' })
  productDescription: string;

  @ApiProperty({ example: 1 })
  productCategoryId: number;

  @ApiProperty({ example: 100 })
  productStock: number;

  @ApiProperty({ example: 999.99 })
  price: number;

  @ApiProperty()
  createAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ProductImageResponseDto] })
  images?: ProductImageResponseDto[];
}
