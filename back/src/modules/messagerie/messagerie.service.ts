import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagerieService {

  create(dto: CreateMessageDto) {
    // TODO: this.prisma.messagerie.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.messagerie.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.messagerie.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateMessageDto>) {
    // TODO: this.prisma.messagerie.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.messagerie.delete({ where: { id } })
    return { id };
  }
}
