import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return { data, total };
  }

  findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  deactivate(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { estado: 'INATIVO' },
    });
  }
}

