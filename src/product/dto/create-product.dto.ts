import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Ürün adı', example: 'Akıllı Telefon' })
  @IsString()
  productName: string;

  @ApiPropertyOptional({
    description: 'Ürün açıklaması',
    example: 'Yeni nesil akıllı telefon',
  })
  @IsString()
  @IsOptional()
  productDescription: string;

  @ApiProperty({ description: "Kategori ID'si", example: 1 })
  @IsInt()
  productCategoryId: number;

  @ApiPropertyOptional({ description: 'Stok adedi', example: 50 })
  @IsInt()
  @IsPositive()
  productStock?: number;

  @ApiProperty({ description: 'Fiyat', example: 4999.99 })
  @IsNumber()
  @Type(() => Number)
  price: number;
}
