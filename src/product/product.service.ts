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
import { ProductEntity } from './entities/product.entity';

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

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    return this.productRepository.create(dto);
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
