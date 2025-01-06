import { ProductImage } from '@prisma/client';
import { ProductImageEntity } from '../entities/product-image.entity';
import { ProductImageResponseDto } from '../dto/product-image-response.dto';

export class ProductImageMapper {
  static toEntity(data: ProductImage): ProductImageEntity {
    return new ProductImageEntity(
      data.id,
      data.imageUrl,
      data.productId,
      data.createdAt,
      data.updatedAt,
    );
  }

  static toEntityList(data: ProductImage[]): ProductImageEntity[] {
    return data.map((item) => this.toEntity(item));
  }

  static toDto(entity: ProductImageEntity): ProductImageResponseDto {
    const dto = new ProductImageResponseDto();
    dto.id = entity.id;
    dto.imageUrl = entity.imageUrl;
    dto.productId = entity.productId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
