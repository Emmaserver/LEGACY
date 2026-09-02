import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  create(data: Prisma.ProductCreateInput) {
    return this.productsRepository.create(data);
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

  async update(id: string, data: Prisma.ProductUpdateInput) {
    await this.findById(id); // valida que existe antes de atualizar
    return this.productsRepository.update(id, data);
  }

  async deactivate(id: string) {
    await this.findById(id); // valida que existe antes de desativar
    return this.productsRepository.deactivate(id);
  }
}
