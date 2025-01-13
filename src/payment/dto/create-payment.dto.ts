import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Create3DDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cc_holder_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cc_no: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  expiry_month: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  expiry_year: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cvv: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currency_code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  installments_number: number;
}
