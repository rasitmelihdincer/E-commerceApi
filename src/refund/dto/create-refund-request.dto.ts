import { IsInt, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundRequestDto {
  @ApiProperty({ description: 'Order Item ID' })
  @IsInt()
  orderItemId: number;

  @ApiProperty({ description: 'Quantity to refund' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Description of refund reason', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
