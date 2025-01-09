import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Create3DDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cc_holder_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cc_no: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expiry_month: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expiry_year: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cvv: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency_code: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  installments_number: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  invoice_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  invoice_description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  return_url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cancel_url: string;

  @ApiProperty()
  @IsString()
  items: string;

  hash_key?: string;
}
