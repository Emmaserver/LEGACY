import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data });
  }

  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count(),
    ]);

    return { data, total };
  }

  findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Prisma.CategoryUpdateInput) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  deactivate(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { estado: 'INATIVO' },
    });
  }

  countProducts(categoryId: string) {
    return this.prisma.product.count({
      where: { categoryId },
    });
  }
}
