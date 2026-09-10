import { Injectable, BadRequestException } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async getVendasPorPeriodo(inicio: string, fim: string) {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      throw new BadRequestException('Datas inválidas. Use o formato YYYY-MM-DD.');
    }

    dataFim.setHours(23, 59, 59, 999);

    const vendas = await this.reportsRepository.getVendasPorPeriodo(dataInicio, dataFim);

    const totalVendido = vendas.reduce((soma, v) => soma + Number(v.valorTotal), 0);

    return {
      periodo: { inicio, fim },
      totalVendido,
      quantidadeVendas: vendas.length,
      vendas,
    };
  }

  async getProdutosMaisVendidos(limite: number) {
    const itens = await this.reportsRepository.getSaleItemsAtivos();

    const agrupado = new Map<string, { productId: string; nome: string; quantidadeVendida: number; valorTotal: number }>();

    for (const item of itens) {
      const chave = item.productId;
      const atual = agrupado.get(chave) ?? {
        productId: item.productId,
        nome: item.product.nome,
        quantidadeVendida: 0,
        valorTotal: 0,
      };

      atual.quantidadeVendida += item.quantidade;
      atual.valorTotal += item.quantidade * Number(item.precoUnitario);

      agrupado.set(chave, atual);
    }

    return Array.from(agrupado.values())
      .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida)
      .slice(0, limite);
  }

  async getPagamentosPorCliente(clientId: string) {
    const vendas = await this.reportsRepository.getVendasPorCliente(clientId);

    const totalComprado = vendas.reduce((soma, v) => soma + Number(v.valorTotal), 0);
    const totalPago = vendas.reduce((soma, v) => soma + Number(v.valorPago), 0);

    return {
      clientId,
      totalComprado,
      totalPago,
      totalEmAberto: totalComprado - totalPago,
      vendas,
    };
  }
}
