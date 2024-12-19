import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateCartItemDto {
  @IsInt()
  productId: number;
  @IsInt()
  quantity: number;
}
