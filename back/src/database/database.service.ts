import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';
import type { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;

  async onModuleInit() {
    this.pool = createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',          // Mot de passe XAMPP
      database: 'marketplace_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Connecté à MySQL');
      connection.release();
    } catch (error) {
      console.error('❌ Erreur de connexion à MySQL :', error);
    }
  }

  getPool(): Pool {
    return this.pool;
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T> {
    const [rows] = await this.pool.execute(sql, params);
    return rows as unknown as T;
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('🔌 Connexion MySQL fermée');
  }
}