import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {

  create(dto: CreateNotificationDto) {
    // TODO: this.prisma.notifications.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.notifications.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.notifications.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateNotificationDto>) {
    // TODO: this.prisma.notifications.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.notifications.delete({ where: { id } })
    return { id };
  }
}
