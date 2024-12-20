import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentId?: number;
}
