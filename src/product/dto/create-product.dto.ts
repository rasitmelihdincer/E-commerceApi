import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateProductDto{
    @IsString()
    productName: string;

    @IsString()
    @IsOptional()
    productDescription: string;

    @IsString()
    productCategory: string;

    @IsInt()
    @IsPositive()
    productStock: number;
}