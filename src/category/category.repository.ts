import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { CategoryMapper } from './mappers/category.mapper';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Injectable } from '@nestjs/common';
import { CategoryResponseDto } from './dto/category.dto';
import { Category, Prisma } from '@prisma/client';
@Injectable()
export class CategoryRepository {
  findByName(productName: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly prismaService: PrismaService) {}

  async list(): Promise<CategoryEntity[]> {
    const categories = await this.prismaService.category.findMany({
      include: {
        _count: { select: { products: true } },
        parent: true,
      },
    });

    return categories.map(CategoryMapper.toEntity);
  }

  async create(
    data: Prisma.CategoryCreateInput & { parentId?: number },
  ): Promise<CategoryEntity> {
    const createData: Prisma.CategoryCreateInput = {
      name: data.name,
      parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
    };

    const created = await this.prismaService.category.create({
      data: createData,
      include: {
        parent: true,
        children: true,
      },
    });
    return CategoryMapper.toEntity(created);
  }

  async update(
    id: number,
    data: Prisma.CategoryUpdateInput & { parentId?: number },
  ): Promise<CategoryEntity> {
    const updateData: Prisma.CategoryUpdateInput = {
      name: data.name,
      parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
    };
    const updated = await this.prismaService.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
      },
    });

    return CategoryMapper.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prismaService.category.delete({ where: { id } });
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
        parent: true,
        children: {
          include: { _count: { select: { products: true } } },
        },
      },
    });

    return category ? CategoryMapper.toEntity(category) : null;
  }
}
