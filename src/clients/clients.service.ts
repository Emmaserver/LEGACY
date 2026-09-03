import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  create(dto: CreateClientDto) {
    return this.clientsRepository.create(dto);
  }

  findAll() {
    return this.clientsRepository.findAll();
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
