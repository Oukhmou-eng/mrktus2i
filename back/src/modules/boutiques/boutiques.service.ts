import { Injectable } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';
import { DatabaseService } from '../../database/database.service';
import { slugify } from '../../common/utils/slugify.util';

@Injectable()
export class BoutiquesService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateBoutiqueDto) {
    const connection = await this.db.getPool().getConnection();
    const idUser = 1;
    const baseSlug = slugify(dto.nom).replace(/^-|-$/g, '') || 'boutique';

    try {
      await connection.beginTransaction();
      const [existingSlugs] = await connection.execute<(RowDataPacket & { slug: string })[]>(
        'SELECT slug FROM boutiques WHERE slug = ? OR slug LIKE ?',
        [baseSlug, `${baseSlug}-%`],
      );
      const usedSlugs = new Set(existingSlugs.map(({ slug }) => slug));
      let slug = baseSlug;
      let suffix = 2;
      while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;

      const [boutiqueResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO boutiques
          (id_user, nom, slug, description, logo_url, banniere_url, statut)
         VALUES (?, ?, ?, ?, ?, ?, 'actif')`,
        [idUser, dto.nom.trim(), slug, dto.description?.trim() || null, dto.logo_url?.trim() || null, dto.banniere_url?.trim() || null],
      );
      const idBoutique = boutiqueResult.insertId;
      await connection.execute(
        `INSERT INTO infoboutique
          (id_boutique, adresse, tele, emailprof, instagram, facebook)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idBoutique, dto.adresse?.trim() || null, dto.tele?.trim() || null, dto.emailprof?.trim() || null, dto.instagram?.trim() || null, dto.facebook?.trim() || null],
      );
      await connection.commit();
      return { id_boutique: idBoutique, id_user: idUser, nom: dto.nom.trim(), slug };
    } catch (error: any) {
      await connection.rollback();
      if (error?.code === 'ER_DUP_ENTRY') throw new ConflictException('Cette boutique existe déjà. Veuillez choisir un autre nom.');
      throw error;
    } finally {
      connection.release();
    }
  }

   async findAll() {
    try{
      const boutiques = await this.db.query(`
     SELECT
    b.id_boutique,
    b.nom,
    b.slug,
    b.logo_url,
    b.note_moyenne,
    b.estVerifier,
    COUNT(p.id_produit) AS nbr_produits
FROM boutiques b
LEFT JOIN produits p
    ON p.id_boutique = b.id_boutique
    AND p.statut = 'en_ligne'
WHERE b.statut = 'actif'
GROUP BY
    b.id_boutique,
    b.nom,
    b.slug,
    b.logo_url,
    b.note_moyenne,
    b.estVerifier
        
      `);
      return { boutiques : boutiques ?? [] } ;
      
    }
     catch (error) {
      console.error('Erreur getBoutiques:', error);
      return { boutiques: [] };
    }
  }

  async removeFollow(userId: number, boutiqueId: number) {
    if (!Number.isInteger(userId) || !Number.isInteger(boutiqueId) || userId <= 0 || boutiqueId <= 0) {
      return { success: false, message: 'Identifiants invalides.' };
    }

    try {
      const result: any = await this.db.query(
        'DELETE FROM boutiques_suivies WHERE id_user = ? AND id_boutique = ?',
        [userId, boutiqueId],
      );
      return { success: result?.affectedRows > 0 };
    } catch (error) {
      console.error('Erreur removeFollow:', error);
      return { success: false, message: 'Impossible de retirer le suivi.' };
    }
  }

  async addFollow(userId: number, boutiqueId: number) {
    if (!Number.isInteger(userId) || !Number.isInteger(boutiqueId) || userId <= 0 || boutiqueId <= 0) {
      return { success: false, message: 'Identifiants invalides.' };
    }

    try {
      await this.db.query(
        'INSERT IGNORE INTO boutiques_suivies (id_user, id_boutique) VALUES (?, ?)',
        [userId, boutiqueId],
      );
      return { success: true };
    } catch (error) {
      console.error('Erreur addFollow:', error);
      return { success: false, message: 'Impossible de suivre cette boutique.' };
    }
  }

async findOne(id: number) {
  try {
    // Informations de la boutique
    const boutique = await this.db.query(
      `
      SELECT
        id_boutique,
        nom,
        logo_url,
        banniere_url,
        note_moyenne,
        date_creation,
        estVerifier,
        description
      FROM boutiques
      WHERE id_boutique = ?
      `,
      [id],
    );

    // Produits de la boutique
    const produits = await this.db.query(
      `
      SELECT
        p.id_produit,
        p.nom,
        p.prix,

        pm.url,
        pm.type

      FROM produits p

      LEFT JOIN produit_medias pm
      ON pm.id_media = (
          SELECT pm2.id_media
          FROM produit_medias pm2
          WHERE pm2.id_produit = p.id_produit
          ORDER BY pm2.ordre ASC, pm2.id_media ASC
          LIMIT 1
      )

      WHERE p.id_boutique = ?
      AND p.statut = 'en_ligne'

      ORDER BY p.date_creation DESC
      `,
      [id],
    );

    return {
      boutique: boutique[0] ?? null,
      produits: produits ?? [],
    };

  } catch (error) {
    console.error(error);

    return {
      boutique: null,
      produits: [],
    };
  }
}
  









    async search(searchTerm: string) {
     try{
      const boutiques = await this.db.query(`
     SELECT
    b.id_boutique,
    b.nom,
    b.slug,
    b.logo_url,
    b.note_moyenne,
    b.estVerifier,
    COUNT(p.id_produit) AS nbr_produits
FROM boutiques b
LEFT JOIN produits p
    ON p.id_boutique = b.id_boutique
    AND p.statut = 'en_ligne'
WHERE b.statut = 'actif' AND b.nom LIKE CONCAT('%', ?, '%') OR b.slug LIKE CONCAT('%', ?, '%') 
GROUP BY
    b.id_boutique,
    b.nom,
    b.slug,
    b.logo_url,
    b.note_moyenne,
    b.estVerifier
        
      `, [searchTerm, searchTerm]);
      return { boutiques : boutiques ?? [] } ;
      
    }
     catch (error) {
      console.error('Erreur getBoutiques:', error);
      return { boutiques: [] };
    }
  }



async trie(vtrie: string) {

let orderBy = "ORDER BY created_at DESC";

switch (vtrie) {
  case "mieux_notees":
    orderBy = "ORDER BY b.note_moyenne DESC";
    break;
  case "plus_produits":
    orderBy = "ORDER BY nbr_produits DESC";
    break;
  case "nouvelles":
    orderBy = "ORDER BY b.date_creation DESC";
    break;
 default:
    orderBy = "";
    break;
}
    




     try{
      const boutiques = await this.db.query(`
     SELECT
    b.id_boutique,
    b.nom,
    b.slug,
    b.logo_url,
    b.note_moyenne,
    b.date_creation,
    b.estVerifier,
    COUNT(p.id_produit) AS nbr_produits
FROM boutiques b
LEFT JOIN produits p
    ON p.id_boutique = b.id_boutique
    AND p.statut = 'en_ligne'
WHERE b.statut = 'actif'  
GROUP BY
    b.id_boutique,
    b.nom,
    b.slug,
    b.logo_url,
    b.note_moyenne,
    b.estVerifier  
      ${orderBy}  
      ` );
      return { boutiques : boutiques ?? [] } ;
      
    }
     catch (error) {
      console.error('Erreur getBoutiques:', error);
      return { boutiques: [] };
    }
  }











  update(id: number, dto: Partial<CreateBoutiqueDto>) {
    // TODO: this.prisma.boutiques.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
  
  



    return { id };
  }

async signaler(id: number, motif: string, description: string) {
  try {
    
    await this.db.query(
      `
      INSERT INTO signalements (id_user,type_cible,id_cible, motif, description, date_creation, statut)
      VALUES (1,'boutique',?, ?, ?, NOW(), 'en_cours')
      `,
      [id, motif, description],
    );

return { success: true, message: 'Signalement envoyé avec succès.' };
  }catch (error) {
    
    return { success: false, message: 'Une erreur est survenue lors de l\'envoi du signalement.' };
  }
}


async getAvis(id: number) {
  try {
    const avis = await this.db.query(
      `
      SELECT U.nom,U.prenom,U.logo_url, A.commentaire, A.note FROM  avis A JOIN utilisateurs U ON A.id_user = U.id_user WHERE A.type_cible = 'boutique' AND A.id_cible = ?
      `,
      [id]
    );
    return { avis: avis ?? []  };
  } catch (error) {
    console.error('Erreur getAvis:', error);
    return { avis: [] };
  }
}



async ajouterAvis(id: number, note: number, commentaire: string, userId: number) {
  try {
    await this.db.query(
      `
      INSERT INTO avis (id_user, type_cible, id_cible, note, commentaire, date_creation)
      VALUES (?, 'boutique', ?, ?, ?, NOW())
      `,
      [userId, id, note, commentaire]
    );
    return {  message: 'Avis ajouté avec succès.' };
  } catch (error) {
    console.error('Erreur ajouterAvis:', error);
    return { success: false, message: 'Une erreur est survenue lors de l\'ajout de l\'avis.' };
  }
}







  async getBS(id: number, search = '', sort = '') {
    if (!Number.isInteger(id) || id <= 0) {
      return { boutiques: [] };
    }

    const sortOptions: Record<string, string> = {
      mieux_notees: 'b.note_moyenne DESC, b.nom ASC',
      plus_produits: 'nbr_produits DESC, b.nom ASC',
      nouvelles: 'b.date_creation DESC, b.nom ASC',
    };
    const orderBy = sortOptions[sort] ?? 'bs.date_suivi DESC, b.nom ASC';

    try {
      const boutiques = await this.db.query(`
        SELECT
          b.id_boutique, b.nom, b.slug, b.logo_url, b.note_moyenne, b.estVerifier,
          COUNT(p.id_produit) AS nbr_produits
        FROM boutiques_suivies bs
        INNER JOIN boutiques b ON b.id_boutique = bs.id_boutique
        LEFT JOIN produits p ON p.id_boutique = b.id_boutique AND p.statut = 'en_ligne'
        WHERE bs.id_user = ?
          AND b.statut = 'actif'
          AND (b.nom LIKE CONCAT('%', ?, '%') OR b.slug LIKE CONCAT('%', ?, '%'))
        GROUP BY
          bs.date_suivi, b.id_boutique, b.nom, b.slug, b.logo_url, b.note_moyenne, b.date_creation, b.estVerifier
        ORDER BY ${orderBy}
      `, [id, search, search]);
      return { boutiques: boutiques ?? [] };
    } catch (error) {
      console.error('Erreur getBoutiquesSuivies:', error);
      return { boutiques: [] };
    }
  }











async tries(vtrie: string, id:number) {

let orderBy = "ORDER BY created_at DESC";

switch (vtrie) {
  case "mieux_notees":
    orderBy = "ORDER BY b.note_moyenne DESC";
    break;
  case "plus_produits":
    orderBy = "ORDER BY nbr_produits DESC";
    break;
  case "nouvelles":
    orderBy = "ORDER BY b.date_creation DESC";
    break;
 default:
    orderBy = "";
    break;
}
    




     try{
      const boutiques = await this.db.query(`
     SELECT
    b.id_boutique,
    b.nom,
    b.slug,
    b.logo_url,
    b.note_moyenne,
    b.date_creation,
    b.estVerifier,
    COUNT(p.id_produit) AS nbr_produits
FROM boutiques b
LEFT JOIN produits p
    ON p.id_boutique = b.id_boutique
    AND p.statut = 'en_ligne'
LEFT JOIN boutiques_suivies bs
    ON bs.id_boutique = b.id_boutique
    AND id_user = ?
WHERE b.statut = 'actif'  
GROUP BY
    b.id_boutique,
    b.nom,
    b.slug,
    b.logo_url,
    b.note_moyenne,
    b.estVerifier  
      ${orderBy}  
      `  ,[id]);
      return { boutiques : boutiques ?? [] } ;
      
    }
     catch (error) {
      console.error('Erreur getBoutiques:', error);
      return { boutiques: [] };
    }
  }















}




