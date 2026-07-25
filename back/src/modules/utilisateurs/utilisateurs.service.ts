import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class UtilisateursService {
     constructor(private readonly db: DatabaseService) {}
  create(dto: CreateUtilisateurDto) {
    // TODO: this.prisma.utilisateurs.create({ data: dto })
    return dto;
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

  findAll() {
    // TODO: this.prisma.utilisateurs.findMany()
    return [];
  }

  findOne(id: number) {
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
  update(id: number, dto: Partial<CreateUtilisateurDto>) {
    // TODO: this.prisma.utilisateurs.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.utilisateurs.delete({ where: { id } })
    return { id };
  }
}
