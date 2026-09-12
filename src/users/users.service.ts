import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.usersRepository.create({
      nome: dto.nome,
      email: dto.email,
      passwordHash,
      papel: dto.papel,
    });
  }

  async findAll(pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const { data, total } = await this.usersRepository.findAll(skip, limit);

    return paginate(data, total, page, limit);
  }

  deactivate(id: string) {
    return this.usersRepository.deactivate(id);
  }
}
