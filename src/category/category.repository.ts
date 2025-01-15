import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { CategoryMapper } from './mappers/category.mapper';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CategoryResponseDto } from './dto/category.dto';
import { Category, Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const CATEGORY_LIST_CACHE_KEY = 'categories:list';
const CATEGORY_DETAIL_CACHE_PREFIX = 'categories:detail:';

@Injectable()
export class CategoryRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async list(): Promise<CategoryEntity[]> {
    // Önce önbellekten veriyi almayı dene
    const cachedCategories = await this.cacheManager.get<CategoryEntity[]>(
      CATEGORY_LIST_CACHE_KEY,
    );
    if (cachedCategories) {
      return cachedCategories;
    }

    // Önbellekte yoksa veritabanından getir
    const categories = await this.prismaService.category.findMany({
      include: {
        _count: { select: { products: true } },
        parent: true,
      },
    });

    const categoryEntities = categories.map(CategoryMapper.toEntity);

    // Önbelleğe kaydet
    await this.cacheManager.set(CATEGORY_LIST_CACHE_KEY, categoryEntities);

    return categoryEntities;
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

    // Önbelleği temizle
    await this.invalidateCategoryCaches();

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

    // Önbelleği temizle
    await this.invalidateCategoryCaches();

    return CategoryMapper.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prismaService.category.delete({ where: { id } });

    // Önbelleği temizle
    await this.invalidateCategoryCaches();
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    // Önbellekten kategoriyi almayı dene
    const cacheKey = `${CATEGORY_DETAIL_CACHE_PREFIX}${id}`;
    const cachedCategory =
      await this.cacheManager.get<CategoryEntity>(cacheKey);
    if (cachedCategory) {
      return cachedCategory;
    }

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

    if (!category) {
      return null;
    }

    const categoryEntity = CategoryMapper.toEntity(category);

    // Önbelleğe kaydet
    await this.cacheManager.set(cacheKey, categoryEntity);

    return categoryEntity;
  }

  private async invalidateCategoryCaches(): Promise<void> {
    await this.cacheManager.del(CATEGORY_LIST_CACHE_KEY);
    // Not: Gerçek ortamda, önbellekteki tekil kategori kayıtlarını temizlemek için
    // daha gelişmiş bir yöntem kullanmak gerekebilir, örneğin önbellekteki anahtarların listesini tutmak gibi
  }
}
