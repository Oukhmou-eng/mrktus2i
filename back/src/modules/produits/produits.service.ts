import { BadRequestException, Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { CreateProduitDto } from './dto/create-produit.dto';
import { DatabaseService } from '../../database/database.service';


@Injectable()
export class ProduitsService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateProduitDto, medias: Array<{ type: 'image' | 'video'; url: string; ordre: number }>) {
    const connection = await this.db.getPool().getConnection();
    const idUser = 1;

    try {
      await connection.beginTransaction();
      const [boutiques] = await connection.execute<(RowDataPacket & { id_boutique: number })[]>(
        `SELECT id_boutique FROM boutiques WHERE id_user = ? AND statut = 'actif'
         ORDER BY date_creation ASC LIMIT 1`,
        [idUser],
      );
      if (!boutiques.length) throw new BadRequestException('Créez d’abord une boutique active avant de publier un produit.');

      const [categories] = await connection.execute<(RowDataPacket & { id_categorie: number })[]>(
        'SELECT id_categorie FROM categories WHERE LOWER(nom) = LOWER(?) LIMIT 1',
        [dto.categorie.trim()],
      );
      if (!categories.length) throw new BadRequestException('La catégorie sélectionnée est introuvable.');

      const [produitResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO produits (id_boutique, id_categorie, nom, description, prix, stock, statut)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [boutiques[0].id_boutique, categories[0].id_categorie, dto.nom.trim(), dto.description?.trim() || null, dto.prix, dto.stock, dto.statut || 'en_ligne'],
      );
      const idProduit = produitResult.insertId;
      for (const media of medias) {
        await connection.execute(
          'INSERT INTO produit_medias (id_produit, type, url, ordre) VALUES (?, ?, ?, ?)',
          [idProduit, media.type, media.url, media.ordre],
        );
      }

      await connection.commit();
      return { id_produit: idProduit, id_boutique: boutiques[0].id_boutique, statut: dto.statut || 'en_ligne', medias };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  findAll() {
    // TODO: this.prisma.produits.findMany()
    return [];
  }

  async getMesProduits(id: number) {
    try {
      const produits = await this.db.query(
        `SELECT
          p.id_produit,
          p.nom,
          p.prix,
          p.stock,
          p.statut,
          p.id_categorie,
          c.nom AS categorie_nom,
          b.nom AS boutique_nom,
          pm.url AS image_url,
          COALESCE(SUM(cl.quantite), 0) AS ventes
        FROM produits p
        INNER JOIN boutiques b ON b.id_boutique = p.id_boutique
        LEFT JOIN categories c ON c.id_categorie = p.id_categorie
        LEFT JOIN produit_medias pm ON pm.id_media = (
          SELECT pm2.id_media
          FROM produit_medias pm2
          WHERE pm2.id_produit = p.id_produit
          ORDER BY pm2.ordre ASC, pm2.id_media ASC
          LIMIT 1
        )
        LEFT JOIN commande_lignes cl ON cl.id_produit = p.id_produit
        WHERE b.id_user = ?
        GROUP BY p.id_produit, p.nom, p.prix, p.stock, p.statut, p.id_categorie,
                 c.nom, b.nom, pm.url
        ORDER BY p.date_creation DESC, p.id_produit DESC`,
        [id],
      );

      return { produits: produits ?? [] };
    } catch (error) {
      console.error('Erreur getMesProduits:', error);
      return { produits: [] };
    }
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

  async remove(id: number) {
    try {
      const result: any = await this.db.query(
        `DELETE FROM produits WHERE id_produit = ?`,
        [id],
      );
      return { success: result?.affectedRows > 0 };
    } catch (error) {
      console.error('Erreur lors de la suppression du produit :', error);
      return { success: false, error: 'Impossible de supprimer le produit' };
    }
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
