import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  IsNumber,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  productName: string;

  @IsString()
  @IsOptional()
  productDescription: string;

  @IsInt()
  productCategoryId: number;

  @IsInt()
  @IsPositive()
  productStock?: number;

  @IsNumber()
  @Type(() => Number)
  price: number;
}
