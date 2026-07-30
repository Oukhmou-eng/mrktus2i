import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class UtilisateursService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateUtilisateurDto) {
    const { prenom, nom, email, password, tele, role, statut } = dto;

    if (!prenom?.trim() || !nom?.trim() || !email?.trim() || !password) {
      throw new BadRequestException('Prénom, nom, email et mot de passe sont requis.');
    }

    const existing = await this.db.query('SELECT id_user FROM utilisateurs WHERE email = ?', [email.trim()]);
    if (existing?.length > 0) {
      throw new BadRequestException('Cet email est déjà utilisé.');
    }

    const normalizedRole = role?.toLowerCase() === 'admin' ? 'admin' : 'user';
    const normalizedStatut = statut === 'suspendu' ? 'suspendu' : 'actif';
    const hashedPassword = await bcrypt.hash(password, 10);

    const result: any = await this.db.query(
      `INSERT INTO utilisateurs (nom, prenom, email, password, tele, role, statut, date_creation)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nom.trim(), prenom.trim(), email.trim(), hashedPassword, tele?.trim() || null, normalizedRole, normalizedStatut],
    );

    return {
      id_user: result?.insertId ?? null,
      prenom: prenom.trim(),
      nom: nom.trim(),
      email: email.trim(),
      tele: tele?.trim() || null,
      role: normalizedRole,
      statut: normalizedStatut,
    };
  }

  async par(id: number) {
  try {
    const users = await this.db.query(
      `
      SELECT
        u.prenom,
        u.nom,
        u.email,
        u.tele,
        u.logo_url,
        a.ville,
        a.ligne1 AS adresse,
        a.code_postal
      FROM utilisateurs u
      LEFT JOIN adresses a
        ON u.id_user = a.id_user
      WHERE u.id_user = ?
      `,
      [id],
    );

    return { user: users[0] ?? null, };
  } catch (error) {
    console.error(error);

    return {
      msg: "Erreur",
    };
  }
}

  async findAll() {
    return this.findAllAdmin();
  }

  async findAllAdmin(search = '', role = '', statut = '') {
    const conditions = ['1=1'];
    const params: any[] = [];

    if (search?.trim()) {
      conditions.push(`(prenom LIKE ? OR nom LIKE ? OR email LIKE ?)`);
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (role) {
      const normalizedRole = role.toLowerCase() === 'admin' ? 'admin' : 'user';
      conditions.push('role = ?');
      params.push(normalizedRole);
    }

    if (statut) {
      const normalizedStatut = statut === 'suspendu' ? 'suspendu' : 'actif';
      conditions.push('statut = ?');
      params.push(normalizedStatut);
    }

    const users = await this.db.query(
      `SELECT id_user, prenom, nom, email, tele, logo_url, role, statut, date_creation
       FROM utilisateurs
       WHERE ${conditions.join(' AND ')}
       ORDER BY date_creation DESC`,
      params,
    );

    return { users: users ?? [] };
  }

  async findOne(id: number) {
    // TODO: this.prisma.utilisateurs.findUnique({ where: { id } })
    return { id };
  }

  async updateMe(id: number, dto: Partial<CreateUtilisateurDto>) {
    const { prenom, nom, email, tele, adresse, ville, code_postal } = dto;
    const connection = await this.db.getPool().getConnection();

    try {
      await connection.beginTransaction();
      await connection.execute(
        `UPDATE utilisateurs
         SET prenom = ?, nom = ?, email = ?, tele = ?
         WHERE id_user = ?`,
        [prenom ?? null, nom ?? null, email ?? null, tele ?? null, id],
      );

      const [addresses] = await connection.execute(
        'SELECT id_user FROM adresses WHERE id_user = ? LIMIT 1',
        [id],
      );

      if ((addresses as any[]).length > 0) {
        await connection.execute(
          `UPDATE adresses
           SET ligne1 = ?, ville = ?, code_postal = ?
           WHERE id_user = ?`,
          [adresse ?? null, ville ?? null, code_postal ?? null, id],
        );
      } else {
        await connection.execute(
          `INSERT INTO adresses (id_user, ligne1, ville, code_postal)
           VALUES (?, ?, ?, ?)`,
          [id, adresse ?? null, ville ?? null, code_postal ?? null],
        );
      }

      await connection.commit();
      return this.par(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  async updatePassword(id: number, motDePasseActuel: string, nouveauMotDePasse: string) {
    if (!motDePasseActuel || nouveauMotDePasse.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères.');
    }

    const users = await this.db.query<{ password: string }[]>(
      'SELECT password FROM utilisateurs WHERE id_user = ?',
      [id],
    );
    const user = users[0];

    if (!user || !(await bcrypt.compare(motDePasseActuel, user.password))) {
      throw new UnauthorizedException('Le mot de passe actuel est incorrect.');
    }

    const password = await bcrypt.hash(nouveauMotDePasse, 10);
    await this.db.query('UPDATE utilisateurs SET password = ? WHERE id_user = ?', [password, id]);
    return { message: 'Mot de passe mis à jour avec succès.' };
  }
  async updateLogoUrl(id: number, logoUrl: string | null) {
    await this.db.query(
      'UPDATE utilisateurs SET logo_url = ? WHERE id_user = ?',
      [logoUrl, id],
    );
    return this.par(id);
  }
  async updateRoleByAdmin(id: number, role: string) {
    const normalizedRole = role?.toLowerCase() === 'admin' ? 'admin' : 'user';
    const result: any = await this.db.query(
      'UPDATE utilisateurs SET role = ? WHERE id_user = ?',
      [normalizedRole, id],
    );
    return { success: result?.affectedRows > 0, role: normalizedRole };
  }

  async updateStatutByAdmin(id: number, statut: string) {
    const normalizedStatut = statut === 'suspendu' ? 'suspendu' : 'actif';
    const result: any = await this.db.query(
      'UPDATE utilisateurs SET statut = ? WHERE id_user = ?',
      [normalizedStatut, id],
    );
    return { success: result?.affectedRows > 0, statut: normalizedStatut };
  }

  update(id: number, dto: Partial<CreateUtilisateurDto>) {
    // TODO: this.prisma.utilisateurs.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.utilisateurs.delete({ where: { id } })
    return { id };
  }
}
