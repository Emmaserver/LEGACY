import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

const LIMITE_STOCK_BAIXO = 10;

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getResumo() {
    const agora = new Date();

    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const inicioAmanha = new Date(inicioHoje);
    inicioAmanha.setDate(inicioAmanha.getDate() + 1);

    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioProximoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

    const [vendasHoje, vendasMes, valorPendente, produtosStockBaixo] =
      await Promise.all([
        this.dashboardRepository.getVendasResumo(inicioHoje, inicioAmanha),
        this.dashboardRepository.getVendasResumo(inicioMes, inicioProximoMes),
        this.dashboardRepository.getValorPendente(),
        this.dashboardRepository.getProdutosStockBaixo(LIMITE_STOCK_BAIXO),
      ]);

    return {
      vendasHoje,
      vendasMes,
      valorPendente,
      produtosStockBaixo,
    };
  }
}
