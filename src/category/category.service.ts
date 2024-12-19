import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CategoryMapper } from './mappers/category.mapper';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async list() {
    const category = await this.categoryRepository.list();
    return category.map(CategoryMapper.toDto);
  }

  async create(dto: CreateCategoryDto) {
    const entity = await this.categoryRepository.create(dto);
    return CategoryMapper.toDto(entity);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.categoryRepository.update(id, dto);
    if (!existing) {
      throw new Error('Category not found');
    }
    const updated = await this.categoryRepository.update(id, dto);
    return CategoryMapper.toDto(updated);
  }
  async delete(id: number) {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Category not found');
    }
    await this.categoryRepository.delete(id);
  }
}
