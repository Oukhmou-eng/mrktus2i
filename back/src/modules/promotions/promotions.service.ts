import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePromotionDto) {
    // TODO: this.prisma.promotions.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.promotions.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.promotions.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreatePromotionDto>) {
    // TODO: this.prisma.promotions.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.promotions.delete({ where: { id } })
    return { id };
  }
}
