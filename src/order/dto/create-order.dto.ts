import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'Address ID for delivery' })
  @IsNumber()
  @IsNotEmpty()
  addressId: number;
}
