import { Product } from '@prisma/client';
import { ProductEntity } from '../entities/product.entity';
import { ProductResponseDto } from '../dto/product-response.dto';

export class ProductMapper {
  static toEntity(product: Product): ProductEntity {
    const entity = new ProductEntity();
    entity.id = product.id;
    entity.productName = product.productName;
    entity.productDescription = product.productDescription;
    entity.productCategoryId = product.productCategoryId;
    entity.productStock = product.productStock;
    entity.price = Number(product.price);
    entity.createAt = product.createAt;
    entity.updatedAt = product.updatedAt;
    return entity;
  }

  static toDto(entity: ProductEntity): ProductResponseDto {
    return {
      id: entity.id,
      productName: entity.productName,
      productDescription: entity.productDescription,
      productCategoryId: entity.productCategoryId,
      productStock: entity.productStock,
      price: entity.price,
      createAt: entity.createAt,
      updatedAt: entity.updatedAt,
    };
  }
}
