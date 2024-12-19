import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { ProductRepository } from './product.repository';
import { ProductEntity } from './entities/product.entity';
import { ProductMapper } from './mappers/product.mapper';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryRepository } from 'src/category/category.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async list() {
    const products = await this.productRepository.list();
    return products.map(ProductMapper.toDto);
  }

  async create(dto: CreateProductDto) {
    const existing = await this.productRepository.findByName(dto.productName);
    if (existing) {
      throw new BadRequestException('Bu ürün ismi zaten kullanılıyor');
    }
    if (dto.productCategoryId) {
      const category = await this.categoryRepository.findById(
        dto.productCategoryId,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const created = await this.productRepository.create(dto);
    return ProductMapper.toDto(created);
  }

  async update(id: number, dto: UpdateProductDto) {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    const updated = await this.productRepository.update(id, dto);
    return ProductMapper.toDto(updated);
  }

  async delete(id: number) {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) throw new NotFoundException('Kayıt Bulunamadı');
    return this.productRepository.delete(id);
  }

  async getById(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return ProductMapper.toDto(product);
  }
}
