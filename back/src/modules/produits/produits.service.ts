import { Injectable } from '@nestjs/common';
import { CreateProduitDto } from './dto/create-produit.dto';
import { DatabaseService } from '../../database/database.service';


@Injectable()
export class ProduitsService {
  constructor(private readonly db: DatabaseService) {}

  create(dto: CreateProduitDto) {
    // TODO: this.prisma.produits.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.produits.findMany()
    return [];
  }

  async findOne(id: number) {
  try {
    const produits = await this.db.query(
      `
      SELECT
        p.id_produit,
        p.nom,
        p.description,
        p.prix,
        p.id_boutique,
        b.nom AS boutique_nom
      FROM produits p
      INNER JOIN boutiques b
        ON b.id_boutique = p.id_boutique
      WHERE p.id_produit = ?
      LIMIT 1
      `,
      [id],
    );

    if (produits.length === 0) {
      return null;
    }

    const medias = await this.db.query(
      `
      SELECT
        type,
        url,
        ordre
      FROM produit_medias
      WHERE id_produit = ?
      ORDER BY ordre ASC, id_media ASC
      `,
      [id],
    );

    return {
      ...produits[0],
      medias,
    };
  } catch (error) {
    console.error('Erreur findOne :', error);
    throw error;
  }
}

  update(id: number, dto: Partial<CreateProduitDto>) {
    // TODO: this.prisma.produits.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.produits.delete({ where: { id } })
    return { id };
  }







async getAvis(id: number) {
  try {
    const avis = await this.db.query(
      `
      SELECT U.nom,U.prenom,U.logo_url, A.commentaire, A.note FROM  avis A JOIN utilisateurs U ON A.id_user = U.id_user WHERE A.type_cible = 'produit' AND A.id_cible = ?
      `,
      [id]
    );
    return { avis: avis ?? []  };
  } catch (error) {
    console.error('Erreur getAvis:', error);
    return { avis: [] };
  }
}





async findSimilarProducts(shopId: number, idCategorie: number) {
  try {
    const produitsVedette = await this.db.query(
      `
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
      INNER JOIN categories c
        ON c.id_categorie = p.id_categorie
      LEFT JOIN produit_medias pm
        ON pm.id_media = (
          SELECT pm2.id_media
          FROM produit_medias pm2
          WHERE pm2.id_produit = p.id_produit
          ORDER BY pm2.ordre ASC, pm2.id_media ASC
          LIMIT 1
        )
      WHERE
        p.statut = 'en_ligne'
        AND (p.id_boutique = ? OR c.id_categorie = ?)
      ORDER BY p.date_creation DESC
      LIMIT 5
      `,
      [shopId, idCategorie],
    );

    return { produitsVedette: produitsVedette ?? [] };
  } catch (error) {
    console.error('Erreur findSimilarProducts:', error);
    return { produitsVedette: [] };
  }
}




}
