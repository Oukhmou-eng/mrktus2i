import { Injectable } from '@nestjs/common';
import { CreateSignalementDto } from './dto/create-signalement.dto';

@Injectable()
export class AdminService {

  create(dto: CreateSignalementDto) {
    // TODO: this.prisma.admin.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.admin.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.admin.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateSignalementDto>) {
    // TODO: this.prisma.admin.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.admin.delete({ where: { id } })
    return { id };
  }
}
