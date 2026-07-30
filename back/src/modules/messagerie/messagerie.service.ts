import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { OkPacket } from 'mysql2';
import { DatabaseService } from '../../database/database.service';

interface CreateMessagePayload {
  id_conversation?: number;
  id_boutique?: number;
  contenu: string;
  type_message?: string;
  id_produit?: number;
}

@Injectable()
export class MessagerieService {
  constructor(private readonly db: DatabaseService) {}

  async getConversations(userId: number, boutiqueId: number | null) {
    const isBoutiqueView = Boolean(boutiqueId);
    const query = `
      SELECT
        c.id_conversation,
        c.id_user,
        c.id_boutique,
        b.nom AS boutique_nom,
        b.logo_url AS boutique_avatar,
        CONCAT(u.nom, ' ', u.prenom) AS client_nom,
        u.logo_url AS client_avatar,
        latest.contenu AS dernier_message,
        latest.date_creation AS dernier_message_date,
        SUM(CASE WHEN ms.id_user = ? AND ms.statut != 'lu' THEN 1 ELSE 0 END) AS non_lus
      FROM conversations c
      JOIN (
        SELECT m1.id_conversation, m1.contenu, m1.date_creation, m1.id_message
        FROM messages m1
        INNER JOIN (
          SELECT id_conversation, MAX(date_creation) AS max_date
          FROM messages
          GROUP BY id_conversation
        ) last_msg ON last_msg.id_conversation = m1.id_conversation
          AND last_msg.max_date = m1.date_creation
      ) latest ON latest.id_conversation = c.id_conversation
      LEFT JOIN messages_statuts ms ON ms.id_message = latest.id_message
      LEFT JOIN boutiques b ON b.id_boutique = c.id_boutique
      LEFT JOIN utilisateurs u ON u.id_user = c.id_user
      WHERE ${isBoutiqueView ? 'c.id_boutique = ?' : 'c.id_user = ?'}
      GROUP BY c.id_conversation, c.id_user, c.id_boutique, b.nom, b.logo_url, u.nom, u.prenom, u.logo_url, latest.contenu, latest.date_creation
      ORDER BY latest.date_creation DESC
    `;

    const params = isBoutiqueView ? [userId, boutiqueId as number] : [userId, userId];
    const rows = (await this.db.query<any[]>(query, params)) ?? [];

    return rows.map((row) => ({
      id_conversation: row.id_conversation,
      autre_partie_nom: isBoutiqueView ? row.client_nom : row.boutique_nom,
      autre_partie_avatar: isBoutiqueView ? row.client_avatar : row.boutique_avatar,
      dernier_message: row.dernier_message,
      dernier_message_date: row.dernier_message_date,
      non_lus: Number(row.non_lus ?? 0),
      en_ligne: false,
    }));
  }

  async getMessages(conversationId: number, userId: number, boutiqueId: number | null) {
    await this.validateConversationAccess(conversationId, userId, boutiqueId);

    const messages = (await this.db.query<any[]>(
      `
      SELECT
        m.id_message,
        m.id_conversation,
        m.id_user,
        m.id_produit,
        m.contenu,
        m.type_message,
        m.date_creation,
        m.date_maj,
        COALESCE(ms.statut, 'envoye') AS statut_lecture
      FROM messages m
      LEFT JOIN messages_statuts ms ON ms.id_message = m.id_message AND ms.id_user = ?
      WHERE m.id_conversation = ?
      ORDER BY m.date_creation ASC
      `,
      [userId, conversationId],
    )) ?? [];

    if (messages.length === 0) {
      return [];
    }

    const messageIds = messages.map((message) => message.id_message);
    const placeholders = messageIds.map(() => '?').join(',');
    const pieces = (await this.db.query<any[]>(
      `
      SELECT id_piece_jointe, id_message, url_fichier, nom_fichier, type_fichier, taille_fichier
      FROM messages_pieces_jointes
      WHERE id_message IN (${placeholders})
      `,
      messageIds,
    )) ?? [];

    const piecesByMessage = new Map<number, any[]>();
    for (const piece of pieces) {
      const list = piecesByMessage.get(piece.id_message) ?? [];
      list.push(piece);
      piecesByMessage.set(piece.id_message, list);
    }

    return messages.map((message) => ({
      ...message,
      pieces_jointes: piecesByMessage.get(message.id_message) ?? [],
    }));
  }

  async markConversationAsRead(conversationId: number, userId: number, boutiqueId: number | null) {
    await this.validateConversationAccess(conversationId, userId, boutiqueId);

    await this.db.query(
      `
      INSERT INTO messages_statuts (id_message, id_user, statut, date_lecture)
      SELECT m.id_message, ?, 'lu', NOW()
      FROM messages m
      WHERE m.id_conversation = ?
        AND m.id_user != ?
      ON DUPLICATE KEY UPDATE statut = VALUES(statut), date_lecture = VALUES(date_lecture)
      `,
      [userId, conversationId, userId],
    );

    return { success: true };
  }

  async createMessage(authorId: number, payload: CreateMessagePayload, boutiqueId: number | null) {
    const contenu = payload.contenu?.trim();
    if (!contenu) {
      throw new BadRequestException('Le contenu du message est requis.');
    }

    let conversation: any;
    const hasConversationId =
      payload.id_conversation != null &&
      Number.isInteger(payload.id_conversation) &&
      payload.id_conversation > 0;
    const hasBoutiqueId =
      payload.id_boutique != null &&
      Number.isInteger(payload.id_boutique) &&
      payload.id_boutique > 0;

    if (hasConversationId) {
      const conversationId = payload.id_conversation as number;
      conversation = await this.validateConversationAccess(
        conversationId,
        authorId,
        boutiqueId,
      );
    } else if (hasBoutiqueId) {
      const targetBoutiqueId = payload.id_boutique as number;
      conversation = await this.findOrCreateConversation(
        authorId,
        targetBoutiqueId,
      );
    } else {
      throw new BadRequestException('id_conversation ou id_boutique requis.');
    }

    const insertResult = await this.db.query<OkPacket>(
      `
      INSERT INTO messages
        (id_conversation, id_user, id_produit, contenu, type_message, date_creation, date_maj)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        conversation.id_conversation,
        authorId,
        payload.id_produit ?? null,
        contenu,
        payload.type_message ?? 'texte',
      ],
    );

    const messageId = (insertResult as OkPacket).insertId;
    const recipientUserId = await this.resolveRecipientUserId(authorId, conversation);
    if (recipientUserId) {
      await this.db.query(
        `
        INSERT INTO messages_statuts (id_message, id_user, statut)
        VALUES (?, ?, 'envoye')
        ON DUPLICATE KEY UPDATE statut = 'envoye'
        `,
        [messageId, recipientUserId],
      );
    }

    return {
      id_message: messageId,
      id_conversation: conversation.id_conversation,
      id_user: authorId,
      id_produit: payload.id_produit ?? null,
      contenu,
      type_message: payload.type_message ?? 'texte',
      date_creation: new Date().toISOString(),
      date_maj: new Date().toISOString(),
      pieces_jointes: [],
      statut_lecture: 'envoye',
    };
  }

  async validateConversationAccess(conversationId: number, userId: number, boutiqueId: number | null) {
    const rows = (await this.db.query<any[]>(
      `
      SELECT c.id_conversation, c.id_user, c.id_boutique, b.id_user AS boutique_owner_id
      FROM conversations c
      JOIN boutiques b ON b.id_boutique = c.id_boutique
      WHERE c.id_conversation = ?
      `,
      [conversationId],
    )) ?? [];

    const conversation = rows[0];
    if (!conversation) {
      throw new NotFoundException('Conversation introuvable.');
    }

    const canAccess =
      conversation.id_user === userId ||
      conversation.boutique_owner_id === userId ||
      (boutiqueId !== null && conversation.id_boutique === boutiqueId);

    if (!canAccess) {
      throw new ForbiddenException('Accès interdit à cette conversation.');
    }

    return conversation;
  }

  async findOrCreateConversation(userId: number, boutiqueId: number) {
    const existing = (await this.db.query<any[]>(
      'SELECT * FROM conversations WHERE id_user = ? AND id_boutique = ? LIMIT 1',
      [userId, boutiqueId],
    )) ?? [];

    if (existing.length > 0) {
      return existing[0];
    }

    const insertResult = await this.db.query<OkPacket>(
      `INSERT INTO conversations (id_user, id_boutique, date_creation, date_maj) VALUES (?, ?, NOW(), NOW())`,
      [userId, boutiqueId],
    );

    return {
      id_conversation: (insertResult as OkPacket).insertId,
      id_user: userId,
      id_boutique: boutiqueId,
    };
  }

  async resolveRecipientUserId(authorId: number, conversation: any) {
    if (conversation.id_user === authorId) {
      const rows = (await this.db.query<any[]>(
        'SELECT id_user FROM boutiques WHERE id_boutique = ? LIMIT 1',
        [conversation.id_boutique],
      )) ?? [];
      return rows[0]?.id_user ?? null;
    }

    return conversation.id_user;
  }
}
