import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CategoryMapper } from './mappers/category.mapper';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category.dto';
import { CategoryEntity } from './entities/category.entity';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly i18n: I18nService,
  ) {}
  message = this.i18n.translate('test.CATEGORY_NOT_FOUND');
  async list() {
    const category = await this.categoryRepository.list();
    return category.map(CategoryMapper.toDto);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const entity = await this.categoryRepository.create({
      name: dto.name,
      parentId: dto.parentId,
    });
    return CategoryMapper.toDto(entity);
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(this.message);
    }

    const updatedEntity = await this.categoryRepository.update(id, {
      name: dto.name ?? existing.name,
      parentId: dto.parentId ?? existing.parentId,
    });

    return CategoryMapper.toDto(updatedEntity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.categoryRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(this.message);
    }

    await this.categoryRepository.delete(id);
  }

  async findById(id: number): Promise<CategoryResponseDto> {
    const entity = await this.categoryRepository.findById(id);

    if (!entity) {
      throw new NotFoundException(this.message);
    }

    return CategoryMapper.toDto(entity);
  }
}
