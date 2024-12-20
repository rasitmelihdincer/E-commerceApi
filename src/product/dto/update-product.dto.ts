import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsInt()
  productCategoryId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  productStock?: number;
}
