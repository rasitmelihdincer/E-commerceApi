import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';
export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  parentId?: number;
}
