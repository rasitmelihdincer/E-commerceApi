import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';

type ProductSelect = { [K in keyof Partial<Product>]: boolean };

type ProductListOptions = {
  where?: Prisma.ProductWhereInput | null;
  select?: ProductSelect | null;
};

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* 

  {
    where: Prisma.ProductWhereInput
  }
  
  */

  async list({
    where = null,
    select = null,
  }: ProductListOptions): Promise<Product[]> {
    if (select) {
      return this.prisma.product.findMany({
        select,
      });
    }
    return this.prisma.product.findMany();
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      data,
      where: {
        id,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    return product || null;
  }

  async count(where?: Prisma.ProductWhereInput) {
    return this.prisma.product.count({
      where: where || {},
    });
  }
}
