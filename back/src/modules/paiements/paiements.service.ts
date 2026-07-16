import { Injectable } from '@nestjs/common';
import { CreatePaiementDto } from './dto/create-paiement.dto';

@Injectable()
export class PaiementsService {

  create(dto: CreatePaiementDto) {
    // TODO: this.prisma.paiements.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.paiements.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.paiements.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreatePaiementDto>) {
    // TODO: this.prisma.paiements.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.paiements.delete({ where: { id } })
    return { id };
  }
}
