import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvisDto } from './dto/create-avis.dto';

@Injectable()
export class AvisService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAvisDto) {
    // TODO: this.prisma.avis.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.avis.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.avis.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateAvisDto>) {
    // TODO: this.prisma.avis.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.avis.delete({ where: { id } })
    return { id };
  }
}
