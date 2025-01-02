import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductImageRepository } from './product-image.repository';
import { ProductImageMapper } from './mappers/product-image.mapper';
import { ProductImageResponseDto } from './dto/product-image-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductImageService {
  constructor(
    private readonly repository: ProductImageRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(
    productId: number,
    filename: string,
  ): Promise<ProductImageResponseDto> {
    const imageUrl = `/uploads/products/${filename}`;
    const entity = await this.repository.create(productId, imageUrl);

    return ProductImageMapper.toDto(entity);
  }

  async findByProductId(productId: number): Promise<ProductImageResponseDto[]> {
    const entities = await this.repository.findByProductId(productId);
    return entities.map((entity) => ProductImageMapper.toDto(entity));
  }

  async delete(id: number): Promise<void> {
    const image = await this.repository.findById(id);
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    await this.repository.delete(id);
  }

  async findById(id: number): Promise<ProductImageResponseDto> {
    const image = await this.repository.findById(id);
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    return ProductImageMapper.toDto(image);
  }

  private getBaseUrl(): string {
    return this.configService.get('SERVER_URL') || 'http://localhost:3000';
  }
}
