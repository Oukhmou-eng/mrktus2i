import { Injectable } from '@nestjs/common';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class BoutiquesService {
  constructor(private readonly db: DatabaseService) {}

  create(dto: CreateBoutiqueDto) {
    // TODO: this.prisma.boutiques.create({ data: dto })
    return dto;
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
}
