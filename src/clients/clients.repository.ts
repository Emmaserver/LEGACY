import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ClientCreateInput) {
    return this.prisma.client.create({ data });
  }

  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count(),
    ]);

    return { data, total };
  }

  findById(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Prisma.ClientUpdateInput) {
    return this.prisma.client.update({
      where: { id },
      data,
    });
  }

  deactivate(id: string) {
    return this.prisma.client.update({
      where: { id },
      data: { estado: 'INATIVO' },
    });
  }
}
