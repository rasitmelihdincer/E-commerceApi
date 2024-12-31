import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ProductEntity } from './entities/product.entity';
import { ProductMapper } from './mappers/product.mapper';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type ProductSelect = { [K in keyof Partial<Product>]: boolean };

type ProductListOptions = {
  where?: Prisma.ProductWhereInput | null;
  select?: ProductSelect | null;
};

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* 
  {
    where: Prisma.ProductWhereInput
  }
  */

  async list(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      include: {
        images: true,
      },
    });
    return products.map(ProductMapper.toEntity);
  }

  async createWithImages(
    dto: CreateProductDto,
    imageUrls: string[],
  ): Promise<ProductEntity> {
    // Prisma üzerinden create
    const created = await this.prisma.product.create({
      data: {
        productName: dto.productName,
        productDescription: dto.productDescription,
        productCategoryId: dto.productCategoryId,
        productStock: dto.productStock,
        price: dto.price,
        // images tablosuna çoklu insert
        images: {
          create: imageUrls.map((url) => ({
            imageUrl: url,
          })),
        },
      },
      // Geri dönerken images'i de getirelim
      include: {
        images: true,
      },
    });

    return ProductMapper.toEntity(created);
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
    const existing = await this.prisma.product.findUnique({
      where: {
        id: id,
      },
    });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.product.update({
      where: {
        id: id,
      },
      data: dto,
    });
    return ProductMapper.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    return ProductMapper.toEntity(product);
  }

  async findByName(name: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { productName: name },
    });
    return product ? ProductMapper.toEntity(product) : null;
  }
}
