import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { CategoryMapper } from './mappers/category.mapper';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CategoryRepository {
  findByName(productName: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly prismaService: PrismaService) {}

  async list(): Promise<CategoryEntity[]> {
    const categories = await this.prismaService.category.findMany();
    return categories.map(CategoryMapper.toEntity);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const created = await this.prismaService.category.create({
      data: {
        name: dto.name,
        parentId: dto.parentId,
      },
    });

    return CategoryMapper.toEntity(created);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const existing = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Category not found');
    }

    const updated = await this.prismaService.category.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        parentId: dto.parentId ?? existing.parentId,
      },
    });
    return CategoryMapper.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prismaService.category.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    const cat = await this.prismaService.category.findUnique({ where: { id } });
    if (!cat) return null;
    return CategoryMapper.toEntity(cat);
  }
}
