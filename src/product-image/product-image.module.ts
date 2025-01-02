import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { ProductImageService } from './product-image.service';
import { ProductImageController } from './product-image.controller';
import { ProductImageRepository } from './product-image.repository';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [ProductImageController],
  providers: [ProductImageService, ProductImageRepository],
  exports: [ProductImageService],
})
export class ProductImageModule {}
