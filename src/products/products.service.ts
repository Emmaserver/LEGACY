import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  create(dto: CreateProductDto) {
    const { categoryId, ...rest } = dto;
    return this.productsRepository.create({
      ...rest,
      category: { connect: { id: categoryId } },
    });
  }

  async findAll(pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const { data, total } = await this.productsRepository.findAll(skip, limit);

    return paginate(data, total, page, limit);
  }

  async findById(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    return this.productsRepository.update(id, dto);
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.productsRepository.deactivate(id);
  }
}
