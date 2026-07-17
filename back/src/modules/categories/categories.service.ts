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

async findSearch(search: string) {
  try {

    const mot = `%${search}%`;

    const produits = await this.db.query(
      `
      SELECT
        p.id_produit,
        p.nom,
        p.prix,
        b.nom AS boutique_nom,
        pm.url,
        pm.type
      FROM produits p

      INNER JOIN categories c
        ON c.id_categorie = p.id_categorie

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

      WHERE
      (
        p.nom LIKE ?
        OR b.nom LIKE ?
        OR c.nom LIKE ?
      )
      AND p.statut = 'en_ligne'

      ORDER BY p.date_creation DESC
      `,
      [mot, mot, mot]
    );

    return { produits: produits ?? [] };

  } catch (error) {

    console.error('Erreur findSearch:', error);

    return { produits: [] };

  }
}




async filtre(
  search: string,
  categories: string[] = [],
  priceRanges: string[] = [],
  minRating: boolean = false,
  conditions: string[] = [],
  sort: string = 'pertinence',
  page: number = 1
) {
  try {
    const limit = 12; // produits par page — TODO: ajuster selon le design
    const currentPage = page && page > 0 ? page : 1;
    const offset = (currentPage - 1) * limit;

    const where: string[] = [`p.statut = 'en_ligne'`];
    const params: any[] = [];

    // Recherche texte (nom produit, boutique, catégorie)
    if (search && search.trim()) {
      const mot = `%${search}%`;
      where.push(`(p.nom LIKE ? OR b.nom LIKE ? OR c.nom LIKE ?)`);
      params.push(mot, mot, mot);
    }

    // Catégories cochées (plusieurs possibles → IN)
    if (categories && categories.length > 0) {
      where.push(`c.id_categorie IN (${categories.map(() => '?').join(',')})`);
      params.push(...categories);
    }

    // Tranches de prix cochées (OR entre elles)
    if (priceRanges && priceRanges.length > 0) {
      const priceConditions = priceRanges
        .map((range) => {
          if (range === '0-200') return `p.prix BETWEEN 0 AND 200`;
          if (range === '200-500') return `p.prix BETWEEN 200 AND 500`;
          if (range === '500+') return `p.prix > 500`;
          return null;
        })
        .filter(Boolean);

      if (priceConditions.length > 0) {
        where.push(`(${priceConditions.join(' OR ')})`);
      }
    }

    // Note vendeur ≥ 4
    // TODO: vérifier le vrai nom de la colonne (ex: b.note_moyenne, b.note, etc.)
    if (minRating) {
      where.push(`b.note_moyenne >= 4`);
    }

    // État du produit (neuf / comme-neuf / occasion)
    // TODO: vérifier le vrai nom de la colonne (ex: p.etat)
    if (conditions && conditions.length > 0) {
      where.push(`p.etat IN (${conditions.map(() => '?').join(',')})`);
      params.push(...conditions);
    }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    // Tri
    let orderBy = 'p.date_creation DESC'; // pertinence par défaut
    if (sort === 'prix-asc') orderBy = 'p.prix ASC';
    if (sort === 'prix-desc') orderBy = 'p.prix DESC';
    if (sort === 'nouveautes') orderBy = 'p.date_creation DESC';

    // Requête principale (avec pagination)
    const produits = await this.db.query(
      `
      SELECT
        p.id_produit,
        p.nom,
        p.prix,
        b.nom AS boutique_nom,
        pm.url,
        pm.type
      FROM produits p
      INNER JOIN categories c ON c.id_categorie = p.id_categorie
      INNER JOIN boutiques b ON b.id_boutique = p.id_boutique
      LEFT JOIN produit_medias pm ON pm.id_media = (
        SELECT pm2.id_media
        FROM produit_medias pm2
        WHERE pm2.id_produit = p.id_produit
        ORDER BY pm2.ordre ASC, pm2.id_media ASC
        LIMIT 1
      )
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    // Requête de comptage (pour total / totalPages côté front)
    const countResult = await this.db.query(
      `
      SELECT COUNT(*) AS total
      FROM produits p
      INNER JOIN categories c ON c.id_categorie = p.id_categorie
      INNER JOIN boutiques b ON b.id_boutique = p.id_boutique
      ${whereClause}
      `,
      params
    );

    const total = countResult?.[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      produits: produits ?? [],
      total,
      totalPages,
    };

  } catch (error) {
    console.error('Erreur filtre:', error);
    return { produits: [], total: 0, totalPages: 1 };
  }
}





async findSoldes(page: number = 1) {
  try {
    const limit = 12;
    const currentPage = page > 0 ? page : 1;
    const offset = (currentPage - 1) * limit;

    const produits = await this.db.query(
      `
      SELECT
        p.id_produit,
        p.nom,
        p.prix AS prix_original,
        b.nom AS boutique_nom,
        pm.url,
        pm.type,
        s.id_solde,
        s.type_reduction,
        s.valeur_reduction,
        s.prix_promo,
        s.date_debut,
        s.date_fin
      FROM soldes s
      INNER JOIN produits p
        ON p.id_produit = s.id_produit
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
      WHERE
        s.statut = 'active'
        AND p.statut = 'en_ligne'
        AND NOW() BETWEEN s.date_debut AND s.date_fin
      ORDER BY s.date_creation DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const countResult = await this.db.query(
      `
      SELECT COUNT(*) AS total
      FROM soldes s
      INNER JOIN produits p
        ON p.id_produit = s.id_produit
      WHERE
        s.statut = 'active'
        AND p.statut = 'en_ligne'
        AND NOW() BETWEEN s.date_debut AND s.date_fin
      `
    );

    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      produits: produits ?? [],
      total,
      currentPage,
      totalPages,
      limit,
    };
  } catch (error) {
    console.error('Erreur findSoldes :', error);

    return {
      produits: [],
      total: 0,
      currentPage: 1,
      totalPages: 0,
      limit: 12,
    };
  }
}

}
