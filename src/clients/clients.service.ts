import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  create(dto: CreateClientDto) {
    return this.clientsRepository.create(dto);
  }

  async findAll(pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const { data, total } = await this.clientsRepository.findAll(skip, limit);

    return paginate(data, total, page, limit);
  }

  async findById(id: string) {
    const client = await this.clientsRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Cliente com id ${id} não encontrado`);
    }
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findById(id);
    return this.clientsRepository.update(id, dto);
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.clientsRepository.deactivate(id);
  }
}
