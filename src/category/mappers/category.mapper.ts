import { Category } from '@prisma/client';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryResponseDto } from '../dto/category.dto';

export class CategoryMapper {
  static toEntity(
    category: Category & { parent?: Category; _count?: { products: number } },
  ): CategoryEntity {
    let parent = category.parent ? new CategoryEntity() : null;

    if (parent) {
      parent.id = category.parent.id;
      parent.name = category.parent.name;
      parent.parentId = category.parent.parentId;
      parent.totalProducts = 0;
    }

    const entity = new CategoryEntity();
    entity.id = category.id;
    entity.name = category.name;
    entity.parentId = category.parentId;
    entity.totalProducts = category._count?.products || 0;
    entity.parent = parent;
    return entity;
  }

  static toDto(entity: CategoryEntity): CategoryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      parentId: entity.parentId,
      totalProducts: entity.totalProducts,
      parent: entity.parent,
    };
  }
}
