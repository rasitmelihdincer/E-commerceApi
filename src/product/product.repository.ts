import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { ProductMapper } from './mappers/product.mapper';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const totalCount = await this.prisma.product.count();

    const products = await this.prisma.product.findMany({
      skip,
      take: limit,
      include: {
        images: true,
      },
    });

    // Entity mapleme
    const data = products.map((product) => ProductMapper.toEntity(product));

    return {
      data,
      totalCount,
    };
  }

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const product = await this.prisma.product.create({
      data: {
        productName: dto.productName,
        productDescription: dto.productDescription,
        productCategoryId: dto.productCategoryId,
        productStock: dto.productStock,
        price: dto.price,
      },
    });
    return ProductMapper.toEntity(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        productName: dto.productName,
        productDescription: dto.productDescription,
        productCategoryId: dto.productCategoryId,
        productStock: dto.productStock,
        price: dto.price,
      },
    });
    return ProductMapper.toEntity(product);
  }

  async delete(id: number) {
    const product = await this.prisma.product.delete({
      where: { id },
    });
    return ProductMapper.toEntity(product);
  }

  async findById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });
    return product ? ProductMapper.toEntity(product) : null;
  }
}
