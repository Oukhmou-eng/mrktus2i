import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service'; 
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private  db: DatabaseService,
    private  jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const users = await this.db.query(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email],
    ) as any[];

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
  async register(dto: RegisterDto) {
  const { nom, prenom, email, password } = dto;

  const existingUsers = await this.db.query(
    'SELECT id_user FROM utilisateurs WHERE email = ?',
    [email],
  ) as any[];

  if (existingUsers.length > 0) {
    throw new ConflictException('Email déjà utilisé');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await this.db.query(
    `INSERT INTO utilisateurs
    (nom, prenom, email, password, role, statut, date_creation)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      nom,
      prenom,
      email,
      hashedPassword,
      'user',
      'actif',
      new Date(),
    ],
  );

  return {
    message: 'Utilisateur créé avec succès',
    prenom,
    email,
  };
}

    async login(email: string, password: string) {
    const users = await this.db.query(
      'SELECT * FROM utilisateurs WHERE email = ?', [email]
    ) as any[];

    if (users.length === 0) {
      return { error: 'Email introuvable' };
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: 'Mot de passe incorrect' };
    }

    // Génération du token JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      prenom: user.prenom,
      email: user.email,
    };
  }
}
