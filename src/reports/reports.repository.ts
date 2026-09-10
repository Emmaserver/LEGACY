import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getVendasPorPeriodo(inicio: Date, fim: Date) {
    return this.prisma.sale.findMany({
      where: {
        estado: 'ATIVA',
        createdAt: { gte: inicio, lte: fim },
      },
      include: {
        client: { select: { id: true, nome: true } },
        itens: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSaleItemsAtivos() {
    return this.prisma.saleItem.findMany({
      where: { sale: { estado: 'ATIVA' } },
      include: { product: { select: { id: true, nome: true } } },
    });
  }

  getVendasPorCliente(clientId: string) {
    return this.prisma.sale.findMany({
      where: { clientId },
      include: { pagamentos: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
