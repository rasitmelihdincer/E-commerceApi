import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { ProductMapper } from './mappers/product.mapper';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryRepository } from 'src/category/category.repository';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly i18n: I18nService,
  ) {}

  async list() {
    const products = await this.productRepository.list();
    return products.map(ProductMapper.toDto);
  }

  async create(dto: CreateProductDto) {
    const existing = await this.productRepository.findByName(dto.productName);
    const message = await this.i18n.translate('test.PRODUCT_EXISTS');
    if (existing) {
      throw new BadRequestException(message);
    }
    if (dto.productCategoryId) {
      const category = await this.categoryRepository.findById(
        dto.productCategoryId,
      );
      const message = await this.i18n.translate('test.CATEGORY_NOT_FOUND');
      if (!category) {
        throw new NotFoundException(message);
      }
    }

    const created = await this.productRepository.create(dto);
    return ProductMapper.toDto(created);
  }

  async update(id: number, dto: UpdateProductDto) {
    const existing = await this.productRepository.findById(id);
    const message = await this.i18n.translate('test.PRODUCT_NOT_FOUND');
    if (!existing) {
      throw new NotFoundException(message);
    }
    const updated = await this.productRepository.update(id, dto);
    return ProductMapper.toDto(updated);
  }

  async delete(id: number) {
    const existingProduct = await this.productRepository.findById(id);
    const message = await this.i18n.translate('test.PRODUCT_NOT_FOUND');
    if (!existingProduct) throw new NotFoundException(message);
    return this.productRepository.delete(id);
  }

  async getById(id: number) {
    const product = await this.productRepository.findById(id);
    const message = await this.i18n.translate('test.PRODUCT_NOT_FOUND');
    if (!product) {
      throw new NotFoundException(message);
    }
    return ProductMapper.toDto(product);
  }
}
