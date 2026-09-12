import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { nome: string; email: string; passwordHash: string; papel: 'ADMINISTRADOR' | 'GERENTE' }) {
    return this.prisma.user.create({
      data,
      select: { id: true, nome: true, email: true, papel: true, estado: true, createdAt: true },
    });
  }

  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: { id: true, nome: true, email: true, papel: true, estado: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { data, total };
  }

  deactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { estado: 'INATIVO' },
      select: { id: true, nome: true, email: true, papel: true, estado: true },
    });
  }
}
