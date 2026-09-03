import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ClientCreateInput) {
    return this.prisma.client.create({ data });
  }

  findAll() {
    return this.prisma.client.findMany();
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
