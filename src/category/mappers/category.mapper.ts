import { Category } from '@prisma/client';
import { CategoryEntity } from '../entities/category.entity';

export class CategoryMapper {
  static toEntity(category: Category & { parent?: Category }): CategoryEntity {
    let parent = category.parent ? new CategoryEntity() : null;

    if (parent) {
      parent.id = category.parent.id;
      parent.name = category.parent.name;
      parent.parentId = category.parent.parentId;
    }

    const entity = new CategoryEntity();
    entity.id = category.id;
    entity.name = category.name;
    entity.parentId = category.parentId;
    entity.parent = parent;

    return entity;
  }

  static toDto(entity: CategoryEntity): any {
    return {
      id: entity.id,
      name: entity.name,
      parentId: entity.parentId,
      totalProducts: entity.totalProducts,
      parent: entity.parent,
    };
  }
}
