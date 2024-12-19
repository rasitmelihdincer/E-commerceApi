import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  quantity?: number;
}
