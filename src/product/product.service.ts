import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async list() {
    return this.productRepository.list({});
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.productRepository.create(data);
  }

  async update(id: number, data: Prisma.ProductUpdateInput) {
    return this.productRepository.update(id, data);
  }

  async delete(id: number) {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) throw new BadRequestException('Kayıt Bulunamadı');
    return this.productRepository.delete(id);
  }

  async getStocks() {
    const products = await this.productRepository.list({
      select: { productName: true, productStock: true },
    });

    const totalProducts = await this.productRepository.count();

    const stockSummary = products.reduce((acc, product) => {
      acc[product.productName] = product.productStock;
      return acc;
    }, {});

    return {
      totalProducts,
      stockSummary,
    };
  }
}
