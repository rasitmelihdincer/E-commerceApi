import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId: number;
}
