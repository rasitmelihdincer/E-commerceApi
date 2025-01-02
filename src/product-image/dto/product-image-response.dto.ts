import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/products/image-123.jpg',
  })
  imageUrl: string;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: '2024-01-20T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T12:00:00Z' })
  updatedAt: Date;
}
