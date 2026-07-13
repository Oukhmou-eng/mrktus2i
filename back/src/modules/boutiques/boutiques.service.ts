import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';

@Injectable()
export class BoutiquesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBoutiqueDto) {
    // TODO: this.prisma.boutiques.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.boutiques.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.boutiques.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateBoutiqueDto>) {
    // TODO: this.prisma.boutiques.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.boutiques.delete({ where: { id } })
    return { id };
  }
}
