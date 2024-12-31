import { Product, ProductImage } from '@prisma/client';
import { ProductEntity, ProductImageEntity } from '../entities/product.entity';
import { ProductResponseDto } from '../dto/product-response.dto';
import { AddressMapper } from 'src/address/mappers/address.mapper';

export class ProductMapper {
  static toEntity(
    product: Product & { images?: ProductImage[] },
  ): ProductEntity {
    const entity = new ProductEntity();
    entity.id = product.id;
    entity.productName = product.productName;
    entity.productDescription = product.productDescription;
    entity.productCategoryId = product.productCategoryId;
    entity.productStock = product.productStock;
    entity.price = Number(product.price);
    entity.createAt = product.createAt;
    entity.updatedAt = product.updatedAt;

    if (product.images) {
      entity.images = product.images.map((img) => {
        const imageEntity = new ProductImageEntity();
        imageEntity.id = img.id;
        imageEntity.imageUrl = img.imageUrl;
        imageEntity.productId = img.productId;
        imageEntity.createdAt = img.createdAt;
        imageEntity.updatedAt = img.updatedAt;
        return imageEntity;
      });
    }
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
      images: entity.images,
      createAt: entity.createAt,
      updatedAt: entity.updatedAt,
    };
  }
}
