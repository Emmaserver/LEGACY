import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(dto: CreateCategoryDto) {
    return this.categoriesRepository.create(dto);
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

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);
    return this.categoriesRepository.update(id, dto);
  }

  async deactivate(id: string) {
    await this.findById(id);

    const totalProdutos = await this.categoriesRepository.countProducts(id);
    if (totalProdutos > 0) {
      throw new ConflictException(
        `Não é possível desativar esta categoria: existem ${totalProdutos} produto(s) associado(s).`,
      );
    }

    return this.categoriesRepository.deactivate(id);
  }
}
