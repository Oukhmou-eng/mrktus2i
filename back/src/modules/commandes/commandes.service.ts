import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommandeDto } from './dto/create-commande.dto';

@Injectable()
export class CommandesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCommandeDto) {
    // TODO: this.prisma.commandes.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.commandes.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.commandes.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateCommandeDto>) {
    // TODO: this.prisma.commandes.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.commandes.delete({ where: { id } })
    return { id };
  }
}
