import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HomeService {
  constructor(private readonly db: DatabaseService) {}

  async getHomeData() {
    try {
      const produitsVedette = await this.db.query(`
        SELECT
          p.id_produit,
          p.nom,
          p.prix,
          b.nom AS boutique_nom,
          pm.url,
          pm.type
        FROM produits p
        INNER JOIN boutiques b
          ON b.id_boutique = p.id_boutique
        LEFT JOIN produit_medias pm
          ON pm.id_media = (
            SELECT pm2.id_media
            FROM produit_medias pm2
            WHERE pm2.id_produit = p.id_produit
            ORDER BY pm2.ordre ASC, pm2.id_media ASC
            LIMIT 1
          )
        WHERE p.statut = 'en_ligne'
        ORDER BY p.date_creation DESC ;
      `);

      return { produitsVedette: produitsVedette ?? [] };
    } catch (error) {
      console.error('Erreur getHomeData:', error);
      return { produitsVedette: [] };
    }
  }
}