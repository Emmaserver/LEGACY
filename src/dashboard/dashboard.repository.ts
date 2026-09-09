import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getVendasResumo(inicio: Date, fim: Date) {
    const resultado = await this.prisma.sale.aggregate({
      where: {
        estado: 'ATIVA',
        createdAt: { gte: inicio, lt: fim },
      },
      _sum: { valorTotal: true },
      _count: true,
    });

    return {
      total: Number(resultado._sum.valorTotal ?? 0),
      quantidade: resultado._count,
    };
  }

  async getValorPendente() {
    const vendas = await this.prisma.sale.findMany({
      where: {
        estado: 'ATIVA',
        estadoPagamento: { in: ['PENDENTE', 'PARCIAL'] },
      },
      select: { valorTotal: true, valorPago: true },
    });

    return vendas.reduce(
      (soma, venda) => soma + (Number(venda.valorTotal) - Number(venda.valorPago)),
      0,
    );
  }

  getProdutosStockBaixo(limite: number) {
    return this.prisma.product.findMany({
      where: {
        estado: 'ATIVO',
        quantidadeAtual: { lte: limite },
      },
      select: { id: true, nome: true, quantidadeAtual: true },
      orderBy: { quantidadeAtual: 'asc' },
    });
  }
}
