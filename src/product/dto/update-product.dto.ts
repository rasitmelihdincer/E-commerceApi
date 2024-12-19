import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @IsInt()
  productCategoryId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  productStock?: number;
}
