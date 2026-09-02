import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

  findAll() {
    return this.productsRepository.findAll();
  }

  async findById(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id); // valida que existe antes de atualizar
    return this.productsRepository.update(id, dto);
  }

  async deactivate(id: string) {
    await this.findById(id); // valida que existe antes de desativar
    return this.productsRepository.deactivate(id);
  }
}
