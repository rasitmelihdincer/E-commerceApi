import { IsString, IsOptional } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  district: string;

  @IsString()
  @IsOptional()
  street: string;

  @IsString()
  @IsOptional()
  postcode: string;
}
