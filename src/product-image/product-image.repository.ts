import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ProductImageEntity } from './entities/product-image.entity';
import { ProductImageMapper } from './mappers/product-image.mapper';

@Injectable()
export class ProductImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    productId: number,
    imageUrl: string,
  ): Promise<ProductImageEntity> {
    const image = await this.prisma.productImage.create({
      data: {
        productId,
        imageUrl,
      },
    });
    return ProductImageMapper.toEntity(image);
  }

  async findByProductId(productId: number): Promise<ProductImageEntity[]> {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
    });
    return ProductImageMapper.toEntityList(images);
  }

  async delete(id: number): Promise<ProductImageEntity> {
    const image = await this.prisma.productImage.delete({
      where: { id },
    });
    return ProductImageMapper.toEntity(image);
  }

  async findById(id: number): Promise<ProductImageEntity | null> {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
    });
    return image ? ProductImageMapper.toEntity(image) : null;
  }
}
