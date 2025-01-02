import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Ürün adı', example: 'Akıllı Telefon' })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  productName?: string;

  @ApiPropertyOptional({
    description: 'Ürün açıklaması',
    example: 'Yeni nesil akıllı telefon',
  })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  productDescription?: string;

  @ApiPropertyOptional({ description: "Kategori ID'si", example: 1 })
  @IsInt({ message: 'validation.isInt' })
  productCategoryId?: number;

  @ApiPropertyOptional({ description: 'Stok adedi', example: 50 })
  @IsOptional()
  @IsInt({ message: 'validation.isInt' })
  @IsPositive({ message: 'validation.isPositive' })
  productStock?: number;

  @ApiPropertyOptional({ description: 'Ürün fiyatı', example: '99.99TL' })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  price?: string;
}
