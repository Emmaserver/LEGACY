import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SalesRepository } from './sales.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/utils/paginate';


@Injectable()
export class SalesService {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(pagination: PaginationDto) {
	const page = pagination.page ?? 1;
	const limit = pagination.limit ?? 20;
	const skip = (page - 1) * limit;

	const { data, total }  = await this.salesRepository.findAll(skip, limit);
return paginate(data, total, page, limit);
  }

  async findById(id: string) {
    const sale = await this.salesRepository.findById(id);
    if (!sale) {
      throw new NotFoundException(`Venda com id ${id} não encontrada`);
    }
    return sale;
  }

  async create(dto: CreateSaleDto) {
    const valorPago = dto.valorPago ?? 0;

    // 1. Buscar os produtos para calcular o valor total estimado
    //    e validar as regras ANTES de escrever seja o que for.
    const produtos = await this.prisma.product.findMany({
      where: { id: { in: dto.itens.map((i) => i.productId) } },
    });

    for (const item of dto.itens) {
      const produto = produtos.find((p) => p.id === item.productId);
      if (!produto) {
        throw new NotFoundException(
          `Produto com id ${item.productId} não encontrado`,
        );
      }
    }

    const valorTotalEstimado = dto.itens.reduce((soma, item) => {
      const produto = produtos.find((p) => p.id === item.productId)!;
      return soma + Number(produto.precoVenda) * item.quantidade;
    }, 0);

    const ficaraPago = valorPago >= valorTotalEstimado;

    // 2. Validar regras de negócio ANTES de criar a venda
    let client = null;
    if (dto.clientId) {
      client = await this.prisma.client.findUnique({
        where: { id: dto.clientId },
      });
      if (!client) {
        throw new NotFoundException(
          `Cliente com id ${dto.clientId} não encontrado`,
        );
      }

      if (!ficaraPago && !client.permiteFiado) {
        throw new ForbiddenException(
          'Este cliente não tem permissão para pagamento pendente ou parcial (fiado)',
        );
      }
    } else if (!ficaraPago) {
      throw new BadRequestException(
        'Venda sem cliente identificado deve ser paga por completo no ato',
      );
    }

    // 3. Só agora criamos a venda — todas as regras já foram validadas.
    return this.salesRepository.createSale({
      clientId: dto.clientId,
      itens: dto.itens,
      valorPagoInicial: valorPago,
    });
  }

  async registerPayment(saleId: string, dto: RegisterPaymentDto) {
    const sale = await this.findById(saleId);

    if (sale.estado === 'CANCELADA') {
      throw new BadRequestException(
        'Não é possível registar pagamento numa venda cancelada',
      );
    }

    if (sale.estadoPagamento === 'PAGO') {
      throw new BadRequestException('Esta venda já está totalmente paga');
    }

    return this.salesRepository.registerPayment(saleId, dto.valor);
  }

  async cancel(id: string) {
    await this.findById(id); // valida que existe
    return this.salesRepository.cancelSale(id);
  }
}
