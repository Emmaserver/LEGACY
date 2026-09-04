import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProductWithStock(productId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId },
    });
  }

  findMovementsByProduct(productId: string) {
    return this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async registerMovement(params: {
    productId: string;
    tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
    quantidade: number;
    motivo?: string;
    delta: number; // valor a somar (positivo) ou subtrair (negativo) da quantidadeAtual
  }) {
    const { productId, tipo, quantidade, motivo, delta } = params;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          quantidadeAtual: { increment: delta },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          tipo,
          quantidade,
          motivo,
        },
      });

      return { product, movement };
    });
  }
}
