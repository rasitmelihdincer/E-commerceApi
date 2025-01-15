import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from './category.repository';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, PrismaService],
})
export class CategoryModule {}
