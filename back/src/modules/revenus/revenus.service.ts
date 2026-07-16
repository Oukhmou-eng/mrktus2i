import { Injectable } from '@nestjs/common';
import { CreateRevenuDto } from './dto/create-revenu.dto';

@Injectable()
export class RevenusService {

  create(dto: CreateRevenuDto) {
    // TODO: this.prisma.revenus.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.revenus.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.revenus.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateRevenuDto>) {
    // TODO: this.prisma.revenus.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.revenus.delete({ where: { id } })
    return { id };
  }
}
