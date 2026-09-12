import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.productsService.findAll(pagination);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.productsService.deactivate(id);
  }
}

