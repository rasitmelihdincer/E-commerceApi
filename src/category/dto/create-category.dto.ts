import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;
  @IsInt()
  parentId: number;
}
