import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(data: Prisma.CategoryCreateInput) {
    return this.categoriesRepository.create(data);
  }

  findAll() {
    return this.categoriesRepository.findAll();
  }

  async findById(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Categoria com id ${id} não encontrada`);
    }
    return category;
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    await this.findById(id); // valida que existe antes de atualizar
    return this.categoriesRepository.update(id, data);
  }

  async deactivate(id: string) {
    await this.findById(id); // valida que existe antes de desativar

    const totalProdutos = await this.categoriesRepository.countProducts(id);
    if (totalProdutos > 0) {
      throw new ConflictException(
        `Não é possível desativar esta categoria: existem ${totalProdutos} produto(s) associado(s).`,
      );
    }

    return this.categoriesRepository.deactivate(id);
  }
}
