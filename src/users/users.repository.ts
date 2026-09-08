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

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, nome: true, email: true, papel: true, estado: true, createdAt: true },
    });
  }

  deactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { estado: 'INATIVO' },
      select: { id: true, nome: true, email: true, papel: true, estado: true },
    });
  }
}
