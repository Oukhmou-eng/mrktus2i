import { Injectable } from '@nestjs/common';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CommandesService {
  constructor(private readonly db: DatabaseService) {}

  create(dto: CreateCommandeDto) {
    // TODO: this.prisma.commandes.create({ data: dto })
    return dto;
  }


  async findByUser(userId: number) {
    const commandes = await this.db.query(
      `SELECT
        c.id_commande,
        c.statut,
        c.montant_total,
        c.date_commande,
        MIN(p.nom) AS produit_nom,
        MIN(p.id_produit) AS id_produit,
        MIN(b.nom) AS boutique_nom,
        MIN(pm.url) AS image_url
      FROM commandes c
      LEFT JOIN commande_lignes cl ON cl.id_commande = c.id_commande
      LEFT JOIN produits p ON p.id_produit = cl.id_produit
      LEFT JOIN boutiques b ON b.id_boutique = cl.id_boutique
      LEFT JOIN produit_medias pm ON pm.id_media = (
        SELECT pm2.id_media
        FROM produit_medias pm2
        WHERE pm2.id_produit = p.id_produit
        ORDER BY pm2.ordre ASC, pm2.id_media ASC
        LIMIT 1
      )
      WHERE c.id_user = ?
      GROUP BY c.id_commande, c.statut, c.montant_total, c.date_commande
      ORDER BY c.date_commande DESC, c.id_commande DESC`,
      [userId],
    );

    return { commandes: commandes ?? [] };
  }
  findAll() {
    // TODO: this.prisma.commandes.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.commandes.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<CreateCommandeDto>) {
    // TODO: this.prisma.commandes.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.commandes.delete({ where: { id } })
    return { id };
  }
}
