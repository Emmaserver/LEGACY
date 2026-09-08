import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SaleItemInput {
  productId: string;
  quantidade: number;
}

@Injectable()
export class SalesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sale.findMany({
      include: { itens: true, pagamentos: true, client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: { itens: { include: { product: true } }, pagamentos: true, client: true },
    });
  }

  async createSale(params: {
    clientId?: string;
    itens: SaleItemInput[];
    valorPagoInicial: number;
  }) {
    const { clientId, itens, valorPagoInicial } = params;

    return this.prisma.$transaction(async (tx) => {
      const produtos = await tx.product.findMany({
        where: { id: { in: itens.map((i) => i.productId) } },
      });

      const saleItemsData = itens.map((item) => {
        const produto = produtos.find((p) => p.id === item.productId);
        if (!produto) {
          throw new NotFoundException(
            `Produto com id ${item.productId} não encontrado`,
          );
        }
        return {
          productId: item.productId,
          quantidade: item.quantidade,
          precoUnitario: produto.precoVenda,
        };
      });

      const valorTotal = saleItemsData.reduce(
        (soma, item) => soma + Number(item.precoUnitario) * item.quantidade,
        0,
      );

      for (const item of itens) {
        const resultado = await tx.product.updateMany({
          where: {
            id: item.productId,
            quantidadeAtual: { gte: item.quantidade },
          },
          data: {
            quantidadeAtual: { decrement: item.quantidade },
          },
        });

        if (resultado.count === 0) {
          throw new ConflictException(
            `Stock insuficiente para o produto ${item.productId}`,
          );
        }

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            tipo: 'SAIDA',
            quantidade: item.quantidade,
            motivo: 'Venda',
          },
        });
      }

      let estadoPagamento: 'PENDENTE' | 'PARCIAL' | 'PAGO';
      if (valorPagoInicial >= valorTotal) {
        estadoPagamento = 'PAGO';
      } else if (valorPagoInicial > 0) {
        estadoPagamento = 'PARCIAL';
      } else {
        estadoPagamento = 'PENDENTE';
      }

      const sale = await tx.sale.create({
        data: {
          clientId,
          valorTotal,
          valorPago: valorPagoInicial,
          estadoPagamento,
          itens: {
            create: saleItemsData,
          },
        },
        include: { itens: true },
      });

      if (valorPagoInicial > 0) {
        await tx.payment.create({
          data: {
            saleId: sale.id,
            valor: valorPagoInicial,
          },
        });
      }

      return sale;
    });
  }

  async registerPayment(saleId: string, valor: number) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId } });
      if (!sale) {
        throw new NotFoundException(`Venda com id ${saleId} não encontrada`);
      }

      const novoValorPago = Number(sale.valorPago) + valor;
      const estadoPagamento =
        novoValorPago >= Number(sale.valorTotal) ? 'PAGO' : 'PARCIAL';

      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          valorPago: novoValorPago,
          estadoPagamento,
        },
      });

      await tx.payment.create({
        data: { saleId, valor },
      });

      return updatedSale;
    });
  }

  async cancelSale(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { itens: true },
      });

      if (!sale) {
        throw new NotFoundException(`Venda com id ${id} não encontrada`);
      }

      if (sale.estado === 'CANCELADA') {
        throw new BadRequestException('Esta venda já está cancelada');
      }

      // Devolver o stock de cada item ao armazém
      for (const item of sale.itens) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantidadeAtual: { increment: item.quantidade },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            tipo: 'ENTRADA',
            quantidade: item.quantidade,
            motivo: `Devolução por cancelamento da venda ${id}`,
          },
        });
      }

      return tx.sale.update({
        where: { id },
        data: { estado: 'CANCELADA' },
      });
    });
  }
}
