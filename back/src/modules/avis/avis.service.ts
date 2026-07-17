import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateAvisDto } from './dto/create-avis.dto';

@Injectable()
export class AvisService {
  constructor(private readonly db: DatabaseService) {}

  async create(type_cible: string, id_cible: number, note: number, commentaire: string, id_user: number) {
    const res = await this.db.query<any>(
      'INSERT INTO avis (id_cible, id_user, type_cible, note, commentaire, date_creation) VALUES (?, ?, ?, ?, ?, NOW())',
      [id_cible, id_user, type_cible, note, commentaire],
    );

    return {
      success: true,
      insertId: res.insertId,
    };
  }

  findAll() {
    // TODO: this.prisma.avis.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.avis.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateAvisDto>) {
    // TODO: this.prisma.avis.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.avis.delete({ where: { id } })
    return { id };
  }
}
