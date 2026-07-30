import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CommandesService {
  constructor(private readonly db: DatabaseService) {}

  create(dto: CreateCommandeDto) {
    // TODO: this.prisma.commandes.create({ data: dto })
    return dto;
  }

  async getStatistics(
    user: { id_user: number; id_boutique?: number },
    periode = 7,
  ) {
    const boutiqueId = await this.resolveBoutiqueId(user);
    if (!boutiqueId) {
      throw new ForbiddenException('Aucune boutique associée à cet utilisateur.');
    }

    const currentEnd = new Date();
    currentEnd.setHours(23, 59, 59, 999);

    const currentStart = new Date(currentEnd);
    currentStart.setHours(0, 0, 0, 0);
    currentStart.setDate(currentStart.getDate() - periode + 1);

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - periode);
    previousStart.setHours(0, 0, 0, 0);

    const previousEnd = new Date(currentStart);
    previousEnd.setMilliseconds(-1);

    const currentStartSql = this.formatDateForMySQL(currentStart);
    const currentEndSql = this.formatDateForMySQL(currentEnd);
    const previousStartSql = this.formatDateForMySQL(previousStart);
    const previousEndSql = this.formatDateForMySQL(previousEnd);

    const summaryRows = await this.db.query<any[]>(
      `SELECT
        IFNULL(SUM(cl.sous_total), 0) AS ventes_totales,
        IFNULL(COUNT(DISTINCT c.id_commande), 0) AS commandes_totales,
        IFNULL(SUM(cl.quantite), 0) AS articles_vendus
      FROM commande_lignes cl
      JOIN commandes c ON c.id_commande = cl.id_commande
      WHERE cl.id_boutique = ?
        AND c.statut IN ('confirmee','expediee','livree')
        AND c.date_commande BETWEEN ? AND ?`,
      [boutiqueId, currentStartSql, currentEndSql],
    );

    const previousRows = await this.db.query<any[]>(
      `SELECT
        IFNULL(SUM(cl.sous_total), 0) AS ventes_totales
      FROM commande_lignes cl
      JOIN commandes c ON c.id_commande = cl.id_commande
      WHERE cl.id_boutique = ?
        AND c.statut IN ('confirmee','expediee','livree')
        AND c.date_commande BETWEEN ? AND ?`,
      [boutiqueId, previousStartSql, previousEndSql],
    );

    const ventesTotales = Number(summaryRows?.[0]?.ventes_totales ?? 0);
    const previousVentesTotales = Number(previousRows?.[0]?.ventes_totales ?? 0);
    const deltaVentes = previousVentesTotales > 0
      ? Math.round(((ventesTotales - previousVentesTotales) / previousVentesTotales) * 100)
      : ventesTotales > 0
      ? 100
      : 0;

    const ventesParJourRows = await this.db.query<any[]>(
      `SELECT
        DATE(c.date_commande) AS date_commande,
        IFNULL(SUM(cl.sous_total), 0) AS ventes
      FROM commande_lignes cl
      JOIN commandes c ON c.id_commande = cl.id_commande
      WHERE cl.id_boutique = ?
        AND c.statut IN ('confirmee','expediee','livree')
        AND c.date_commande BETWEEN ? AND ?
      GROUP BY DATE(c.date_commande)
      ORDER BY DATE(c.date_commande) ASC`,
      [boutiqueId, currentStartSql, currentEndSql],
    );

    const formatDateKey = (date: Date) => {
      const pad = (value: number) => String(value).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const ventesParJourMap = new Map<string, number>();
    for (const row of ventesParJourRows) {
      const rawDate = row.date_commande;
      const date = rawDate ? new Date(rawDate) : null;
      if (date && !Number.isNaN(date.getTime())) {
        ventesParJourMap.set(formatDateKey(date), Number(row.ventes ?? 0));
      }
    }

    const jourFormatter = (date: Date) => {
      if (periode <= 7) {
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
      }
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const ventesParJour = Array.from({ length: periode }, (_, index) => {
      const date = new Date(currentStart);
      date.setDate(currentStart.getDate() + index);
      return {
        jour: jourFormatter(date),
        ventes: ventesParJourMap.get(formatDateKey(date)) ?? 0,
      };
    });

    const topProduits = await this.db.query<any[]>(
      `SELECT
        p.nom AS produit,
        COUNT(cl.id_commande_ligne) AS ventes,
        IFNULL(SUM(cl.sous_total), 0) AS revenus
      FROM commande_lignes cl
      JOIN commandes c ON c.id_commande = cl.id_commande
      JOIN produits p ON p.id_produit = cl.id_produit
      WHERE cl.id_boutique = ?
        AND c.statut IN ('confirmee','expediee','livree')
        AND c.date_commande BETWEEN ? AND ?
      GROUP BY p.id_produit, p.nom
      ORDER BY revenus DESC
      LIMIT 10`,
      [boutiqueId, currentStartSql, currentEndSql],
    );

    return {
      resume: {
        ventesTotales,
        deltaVentes,
        commandesTotales: Number(summaryRows?.[0]?.commandes_totales ?? 0),
        articlesVendus: Number(summaryRows?.[0]?.articles_vendus ?? 0),
      },
      ventesParJour: ventesParJour.map((row) => ({
        jour: row.jour,
        ventes: Number(row.ventes ?? 0),
      })),
      topProduits: topProduits.map((row) => ({
        produit: row.produit,
        ventes: Number(row.ventes ?? 0),
        revenus: Number(row.revenus ?? 0),
      })),
    };
  }

  private async resolveBoutiqueId(user: { id_user: number; id_boutique?: number }) {
    if (user?.id_boutique) {
      return Number(user.id_boutique);
    }

    const rows = await this.db.query<any[]>(
      'SELECT id_boutique FROM boutiques WHERE id_user = ? LIMIT 1',
      [user.id_user],
    );

    return rows?.[0]?.id_boutique ? Number(rows[0].id_boutique) : null;
  }

  private formatDateForMySQL(date: Date) {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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

  async findByBoutique(boutiqueId: number, currentUserId?: number) {
    if (!boutiqueId) {
      return { commandes: [] };
    }

    const boutiqueRows = await this.db.query<any[]>(
      'SELECT id_user FROM boutiques WHERE id_boutique = ? LIMIT 1',
      [boutiqueId],
    );
    const boutiqueOwnerId = boutiqueRows?.[0]?.id_user;

    if (currentUserId && boutiqueOwnerId && currentUserId !== boutiqueOwnerId) {
      throw new ForbiddenException('Accès interdit à cette boutique.');
    }

    const commandes = await this.db.query(
      `SELECT
        c.id_commande,
        c.statut,
        c.montant_total,
        c.date_commande,
        MIN(p.nom) AS produit_nom,
        MIN(p.id_produit) AS id_produit,
        MIN(u.nom) AS client_nom,
        MIN(u.prenom) AS client_prenom,
        MIN(b.nom) AS boutique_nom
      FROM commandes c
      LEFT JOIN commande_lignes cl ON cl.id_commande = c.id_commande
      LEFT JOIN produits p ON p.id_produit = cl.id_produit
      LEFT JOIN boutiques b ON b.id_boutique = cl.id_boutique
      LEFT JOIN utilisateurs u ON u.id_user = c.id_user
      WHERE cl.id_boutique = ? OR b.id_boutique = ?
      GROUP BY c.id_commande, c.statut, c.montant_total, c.date_commande
      ORDER BY c.date_commande DESC, c.id_commande DESC`,
      [boutiqueId, boutiqueId],
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

  async update(id: number, dto: Partial<CreateCommandeDto> & { statut?: string }) {
    const allowedStatuses = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee', 'remboursee'];
    const statut = dto.statut;

    if (statut && !allowedStatuses.includes(statut)) {
      throw new Error('Statut invalide.');
    }

    if (statut) {
      await this.db.query('UPDATE commandes SET statut = ? WHERE id_commande = ?', [statut, id]);
    }

    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.commandes.delete({ where: { id } })
    return { id };
  }
}
