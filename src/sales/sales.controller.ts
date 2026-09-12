import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.salesService.findAll(pagination);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.salesService.findById(id);
  }

  @Post(':id/payments')
  registerPayment(
    @Param('id') id: string,
    @Body() dto: RegisterPaymentDto,
  ) {
    return this.salesService.registerPayment(id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.salesService.cancel(id);
  }
}
