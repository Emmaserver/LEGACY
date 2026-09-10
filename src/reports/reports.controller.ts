import { Controller, Get, Query, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  getVendasPorPeriodo(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
  ) {
    return this.reportsService.getVendasPorPeriodo(inicio, fim);
  }

  @Get('top-products')
  getProdutosMaisVendidos(@Query('limite') limite?: string) {
    const limiteNumero = limite ? parseInt(limite, 10) : 10;
    return this.reportsService.getProdutosMaisVendidos(limiteNumero);
  }

  @Get('client-payments/:clientId')
  getPagamentosPorCliente(@Param('clientId') clientId: string) {
    return this.reportsService.getPagamentosPorCliente(clientId);
  }
}
