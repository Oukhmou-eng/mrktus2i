import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProduitDto } from './dto/create-produit.dto';

@Injectable()
export class ProduitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProduitDto) {
    // TODO: this.prisma.produits.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.produits.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.produits.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateProduitDto>) {
    // TODO: this.prisma.produits.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.produits.delete({ where: { id } })
    return { id };
  }
}
