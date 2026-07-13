import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    // TODO: verifier email/password (bcrypt.compare) via this.prisma.utilisateur
    return { id_user: 1, email, role: 'client' };
  }

  async login(user: { id_user: number; role: string }) {
    const payload = { sub: user.id_user, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
