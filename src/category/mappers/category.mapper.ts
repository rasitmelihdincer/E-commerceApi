import { Category } from '@prisma/client';
import { CategoryEntity } from '../entities/category.entity';

export class CategoryMapper {
  static toEntity(category: Category): CategoryEntity {
    const entity = new CategoryEntity();
    entity.id = category.id;
    entity.name = category.name;
    entity.parentId = category.parentId;
    return entity;
  }

  static toDto(entity: CategoryEntity): any {
    return {
      id: entity.id,
      name: entity.name,
      parentId: entity.parentId,
    };
  }
}
