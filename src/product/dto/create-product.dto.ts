import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  productName: string;

  @IsString()
  @IsOptional()
  productDescription: string;

  @IsInt()
  productCategoryId?: number;

  @IsInt()
  @IsPositive()
  productStock?: number;
}
