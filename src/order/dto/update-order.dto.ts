import { IsOptional, IsInt, IsEnum, IsNumber } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsInt()
  addressId?: number;

  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}
