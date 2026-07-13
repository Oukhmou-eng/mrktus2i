import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFavoriDto } from './dto/create-favori.dto';

@Injectable()
export class FavorisService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateFavoriDto) {
    // TODO: this.prisma.favoris.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.favoris.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.favoris.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateFavoriDto>) {
    // TODO: this.prisma.favoris.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.favoris.delete({ where: { id } })
    return { id };
  }
}
