import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StockService } from './stock.service';
import { RegisterEntryDto } from './dto/register-entry.dto';
import { RegisterExitDto } from './dto/register-exit.dto';
import { RegisterAdjustmentDto } from './dto/register-adjustment.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get(':productId')
  getCurrentStock(@Param('productId') productId: string) {
    return this.stockService.getCurrentStock(productId);
  }

  @Get(':productId/history')
  getHistory(@Param('productId') productId: string) {
    return this.stockService.getHistory(productId);
  }

  @Post('entry')
  registerEntry(@Body() dto: RegisterEntryDto) {
    return this.stockService.registerEntry(dto);
  }

  @Post('exit')
  registerExit(@Body() dto: RegisterExitDto) {
    return this.stockService.registerExit(dto);
  }

  @Post('adjustment')
  registerAdjustment(@Body() dto: RegisterAdjustmentDto) {
    return this.stockService.registerAdjustment(dto);
  }
}
