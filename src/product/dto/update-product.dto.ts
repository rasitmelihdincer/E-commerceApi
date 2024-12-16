import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @IsString()
  productCategory?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  productStock?: number;
}
