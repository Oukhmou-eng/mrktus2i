import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateNotificationDto) {
    const result: any = await this.db.query(
      `INSERT INTO notifications (id_user, type, contenu, lien, lu)
       VALUES (?, ?, ?, ?, ?)`,
      [dto.id_user, dto.type, dto.contenu, dto.lien ?? null, dto.lu ? 1 : 0],
    );
    return this.findOne(result.insertId);
  }

  async findAll() {
    return this.db.query(
      `SELECT id_notification, id_user, type, contenu, lien, lu, date_creation
       FROM notifications ORDER BY date_creation DESC, id_notification DESC`,
    );
  }

  async getNotifications(id: number) {
    try {
      const notifications = await this.db.query(
        `SELECT id_notification, id_user, type, contenu, lien, lu, date_creation
         FROM notifications
         WHERE id_user = ?
         ORDER BY date_creation DESC, id_notification DESC`,
        [id],
      );

      return { notifications: notifications ?? [] };
    } catch (error) {
      console.error('Erreur getNotifications:', error);
      return { notifications: [] };
    }
  }

  async findOne(id: number) {
    const rows: any[] = await this.db.query(
      `SELECT id_notification, id_user, type, contenu, lien, lu, date_creation
       FROM notifications WHERE id_notification = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async update(id: number, dto: Partial<CreateNotificationDto>) {
    const fields: string[] = [];
    const values: unknown[] = [];
    const allowedFields = ['type', 'contenu', 'lien', 'lu'] as const;

    for (const field of allowedFields) {
      if (dto[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(field === 'lu' ? Number(dto[field]) : dto[field]);
      }
    }

    if (!fields.length) return this.findOne(id);
    await this.db.query(
      `UPDATE notifications SET ${fields.join(', ')} WHERE id_notification = ?`,
      [...values, id],
    );
    return this.findOne(id);
  }

  async markAllAsRead(userId: number) {
    const result: any = await this.db.query(
      `UPDATE notifications SET lu = 1 WHERE id_user = ? AND lu = 0`,
      [userId],
    );
    return { success: true, updated: result.affectedRows ?? 0 };
  }

  async remove(id: number) {
    const result: any = await this.db.query(
      `DELETE FROM notifications WHERE id_notification = ?`,
      [id],
    );
    return { success: result.affectedRows > 0 };
  }
}
