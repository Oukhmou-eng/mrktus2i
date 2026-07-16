import { Injectable } from '@nestjs/common';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { DatabaseService } from '../../database/database.service'; 

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}
  create(dto: CreateCategorieDto) {
    // TODO: this.prisma.categories.create({ data: dto })
    return dto;
  }

 async findAll() {
    const categories = await this.db.query(
      'SELECT * FROM categories'
    ) as any[];
    if (categories.length === 0) {
      return { error: 'Aucune catégorie trouvée' };
    }

    return categories.map((cat: any) => cat.nom);
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



