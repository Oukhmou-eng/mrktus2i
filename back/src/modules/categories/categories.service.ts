import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategorieDto } from './dto/create-categorie.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCategorieDto) {
    // TODO: this.prisma.categories.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.categories.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.categories.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateCategorieDto>) {
    // TODO: this.prisma.categories.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.categories.delete({ where: { id } })
    return { id };
  }
}
