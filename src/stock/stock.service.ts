import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { StockRepository } from './stock.repository';
import { RegisterEntryDto } from './dto/register-entry.dto';
import { RegisterExitDto } from './dto/register-exit.dto';
import { RegisterAdjustmentDto } from './dto/register-adjustment.dto';

@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockRepository) {}

  async getCurrentStock(productId: string) {
    const product = await this.stockRepository.findProductWithStock(productId);
    if (!product) {
      throw new NotFoundException(`Produto com id ${productId} não encontrado`);
    }
    return {
      productId: product.id,
      nome: product.nome,
      quantidadeAtual: product.quantidadeAtual,
    };
  }

  getHistory(productId: string) {
    return this.stockRepository.findMovementsByProduct(productId);
  }

  async registerEntry(dto: RegisterEntryDto) {
    await this.getCurrentStock(dto.productId); // valida que o produto existe

    return this.stockRepository.registerMovement({
      productId: dto.productId,
      tipo: 'ENTRADA',
      quantidade: dto.quantidade,
      motivo: dto.motivo,
      delta: dto.quantidade, // entrada sempre soma
    });
  }

  async registerExit(dto: RegisterExitDto) {
    const current = await this.getCurrentStock(dto.productId);

    if (current.quantidadeAtual < dto.quantidade) {
      throw new ConflictException(
        `Stock insuficiente. Disponível: ${current.quantidadeAtual}, solicitado: ${dto.quantidade}`,
      );
    }

    return this.stockRepository.registerMovement({
      productId: dto.productId,
      tipo: 'SAIDA',
      quantidade: dto.quantidade,
      motivo: dto.motivo,
      delta: -dto.quantidade, // saída sempre subtrai
    });
  }

  async registerAdjustment(dto: RegisterAdjustmentDto) {
    const current = await this.getCurrentStock(dto.productId);

    if (dto.quantidade === 0) {
      throw new BadRequestException('A quantidade de ajuste não pode ser zero');
    }

    const novaQuantidade = current.quantidadeAtual + dto.quantidade;
    if (novaQuantidade < 0) {
      throw new ConflictException(
        `Este ajuste deixaria o stock negativo. Disponível: ${current.quantidadeAtual}, ajuste: ${dto.quantidade}`,
      );
    }

    return this.stockRepository.registerMovement({
      productId: dto.productId,
      tipo: 'AJUSTE',
      quantidade: Math.abs(dto.quantidade),
      motivo: dto.motivo,
      delta: dto.quantidade, // ajuste pode ser positivo ou negativo
    });
  }
}
