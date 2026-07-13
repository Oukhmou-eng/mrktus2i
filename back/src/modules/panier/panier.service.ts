import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePanierItemDto } from './dto/create-panier-item.dto';

@Injectable()
export class PanierService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePanierItemDto) {
    // TODO: this.prisma.panier.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.panier.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.panier.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreatePanierItemDto>) {
    // TODO: this.prisma.panier.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.panier.delete({ where: { id } })
    return { id };
  }
}
