import { Product, ProductImage } from '@prisma/client';
import { ProductEntity } from '../entities/product.entity';
import { ProductImageMapper } from 'src/product-image/mappers/product-image.mapper';
import { ProductResponseDto } from '../dto/product-response.dto';

export class ProductMapper {
  static toEntity(data: Product & { images?: ProductImage[] }): ProductEntity {
    return {
      id: data.id,
      productName: data.productName,
      productDescription: data.productDescription,
      productCategoryId: data.productCategoryId,
      productStock: data.productStock,
      price: Number(data.price),
      createAt: data.createAt,
      updatedAt: data.updatedAt,
      images: data.images
        ? data.images.map((image) => ProductImageMapper.toEntity(image))
        : undefined,
    };
  }

  static toDto(entity: ProductEntity): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = entity.id;
    dto.productName = entity.productName;
    dto.productDescription = entity.productDescription;
    dto.productCategoryId = entity.productCategoryId;
    dto.productStock = entity.productStock;
    dto.price = entity.price;
    dto.createAt = entity.createAt;
    dto.updatedAt = entity.updatedAt;
    dto.images = entity.images?.map((image) => ProductImageMapper.toDto(image));
    return dto;
  }
}
