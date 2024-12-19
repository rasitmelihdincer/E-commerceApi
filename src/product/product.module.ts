import { Module } from '@nestjs/common';
import { ProductService } from './product.service';

import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { CategoryRepository } from 'src/category/category.repository';

@Module({
  imports: [PrismaModule],
  providers: [ProductService, ProductRepository, CategoryRepository],
  controllers: [ProductController],
})
export class ProductModule {}
