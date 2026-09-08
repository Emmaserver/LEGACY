import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

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

  findAll() {
    return this.usersRepository.findAll();
  }

  deactivate(id: string) {
    return this.usersRepository.deactivate(id);
  }
}
