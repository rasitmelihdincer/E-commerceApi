import { CategoryEntity } from '../entities/category.entity';

export class CategoryResponseDto {
  id: number;
  name: string;
  parentId: number | null;
  totalProducts: number;
  parent?: CategoryEntity | null;
}
