import { Injectable } from '@nestjs/common';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';

@Injectable()
export class UtilisateursService {

  create(dto: CreateUtilisateurDto) {
    // TODO: this.prisma.utilisateurs.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.utilisateurs.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.utilisateurs.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateUtilisateurDto>) {
    // TODO: this.prisma.utilisateurs.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.utilisateurs.delete({ where: { id } })
    return { id };
  }
}
