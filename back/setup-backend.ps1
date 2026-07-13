# ============================================================
# setup-backend.ps1
# Genere toute l'arborescence du backend NestJS "le-panier-back"
# avec les fichiers de base (module/controller/service/dto vides
# mais valides), Prisma, common/, config/, uploads/.
#
# PREREQUIS : execute ce script A LA RACINE d'un projet deja
# cree avec `nest new le-panier-back` (donc package.json,
# tsconfig.json, nest-cli.json existent deja).
#
# Usage (PowerShell) :
#   powershell -ExecutionPolicy Bypass -File setup-backend.ps1
# ou, si l'execution de scripts est deja autorisee :
#   .\setup-backend.ps1
# ============================================================

$ErrorActionPreference = "Stop"

function ConvertTo-PascalCase {
    param([string]$Text)
    $parts = $Text -split '-'
    $result = ""
    foreach ($p in $parts) {
        if ($p.Length -gt 0) {
            $result += $p.Substring(0,1).ToUpper() + $p.Substring(1)
        }
    }
    return $result
}

function ConvertTo-CamelCase {
    param([string]$Text)
    $pascal = ConvertTo-PascalCase $Text
    return $pascal.Substring(0,1).ToLower() + $pascal.Substring(1)
}

function New-FileWithContent {
    param([string]$Path, [string]$Content)
    $dir = Split-Path $Path -Parent
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    Set-Content -Path $Path -Value $Content -Encoding UTF8
}

Write-Host "Creation de l'arborescence src/..."

# ------------------------------------------------------------
# Dossiers transversaux
# ------------------------------------------------------------
$dirs = @(
    "src/config",
    "src/common/guards",
    "src/common/decorators",
    "src/common/filters",
    "src/common/utils",
    "src/prisma",
    "src/modules",
    "prisma/migrations",
    "uploads/produits",
    "uploads/boutiques",
    "uploads/messages",
    "test"
)
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}

# ------------------------------------------------------------
# config/
# ------------------------------------------------------------
New-FileWithContent "src/config/database.config.ts" @'
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));
'@

New-FileWithContent "src/config/jwt.config.ts" @'
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
}));
'@

# ------------------------------------------------------------
# common/
# ------------------------------------------------------------
New-FileWithContent "src/common/decorators/roles.decorator.ts" @'
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
'@

New-FileWithContent "src/common/decorators/current-user.decorator.ts" @'
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
'@

New-FileWithContent "src/common/guards/jwt-auth.guard.ts" @'
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
'@

New-FileWithContent "src/common/guards/roles.guard.ts" @'
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}
'@

New-FileWithContent "src/common/filters/http-exception.filter.ts" @'
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erreur interne du serveur';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
'@

New-FileWithContent "src/common/utils/pagination.util.ts" @'
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function getPaginationOffset({ page = 1, limit = 20 }: PaginationParams) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
'@

New-FileWithContent "src/common/utils/slugify.util.ts" @'
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
'@

# ------------------------------------------------------------
# prisma/
# ------------------------------------------------------------
New-FileWithContent "src/prisma/prisma.service.ts" @'
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
'@

New-FileWithContent "src/prisma/prisma.module.ts" @'
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
'@

New-FileWithContent "prisma/schema.prisma" @'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// TODO: coller ici les 25 modeles issus du script SQL
// (UTILISATEURS, ADRESSES, BOUTIQUES, CATEGORIES, PRODUITS, ...)
'@

# ------------------------------------------------------------
# Fonction de generation d'un module standard
# ------------------------------------------------------------
function New-NestModule {
    param(
        [string]$Slug,     # ex: produits
        [string]$DtoName   # ex: produit (singulier)
    )

    $pascal    = ConvertTo-PascalCase $Slug
    $camel     = ConvertTo-CamelCase $Slug
    $dtoPascal = ConvertTo-PascalCase $DtoName

    $dir = "src/modules/$Slug"

    New-FileWithContent "$dir/$Slug.module.ts" @"
import { Module } from '@nestjs/common';
import { ${pascal}Controller } from './${Slug}.controller';
import { ${pascal}Service } from './${Slug}.service';

@Module({
  controllers: [${pascal}Controller],
  providers: [${pascal}Service],
  exports: [${pascal}Service],
})
export class ${pascal}Module {}
"@

    New-FileWithContent "$dir/$Slug.controller.ts" @"
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ${pascal}Service } from './${Slug}.service';
import { Create${dtoPascal}Dto } from './dto/create-${DtoName}.dto';

@Controller('${Slug}')
export class ${pascal}Controller {
  constructor(private readonly ${camel}Service: ${pascal}Service) {}

  @Post()
  create(@Body() dto: Create${dtoPascal}Dto) {
    return this.${camel}Service.create(dto);
  }

  @Get()
  findAll() {
    return this.${camel}Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.${camel}Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<Create${dtoPascal}Dto>) {
    return this.${camel}Service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.${camel}Service.remove(+id);
  }
}
"@

    New-FileWithContent "$dir/$Slug.service.ts" @"
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Create${dtoPascal}Dto } from './dto/create-${DtoName}.dto';

@Injectable()
export class ${pascal}Service {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: Create${dtoPascal}Dto) {
    // TODO: this.prisma.${camel}.create({ data: dto })
    return dto;
  }

  findAll() {
    // TODO: this.prisma.${camel}.findMany()
    return [];
  }

  findOne(id: number) {
    // TODO: this.prisma.${camel}.findUnique({ where: { id } })
    return { id };
  }

  update(id: number, dto: Partial<Create${dtoPascal}Dto>) {
    // TODO: this.prisma.${camel}.update({ where: { id }, data: dto })
    return { id, ...dto };
  }

  remove(id: number) {
    // TODO: this.prisma.${camel}.delete({ where: { id } })
    return { id };
  }
}
"@

    New-FileWithContent "$dir/dto/create-$DtoName.dto.ts" @"
export class Create${dtoPascal}Dto {
  // TODO: definir les champs (voir table SQL correspondante)
}
"@

    Write-Host "  -> module '$Slug' cree"
}

Write-Host "Creation des modules metier..."

New-NestModule -Slug "utilisateurs"  -DtoName "utilisateur"
New-NestModule -Slug "boutiques"     -DtoName "boutique"
New-NestModule -Slug "categories"    -DtoName "categorie"
New-NestModule -Slug "produits"      -DtoName "produit"
New-NestModule -Slug "panier"        -DtoName "panier-item"
New-NestModule -Slug "favoris"       -DtoName "favori"
New-NestModule -Slug "commandes"     -DtoName "commande"
New-NestModule -Slug "paiements"     -DtoName "paiement"
New-NestModule -Slug "avis"          -DtoName "avis"
New-NestModule -Slug "messagerie"    -DtoName "message"
New-NestModule -Slug "notifications" -DtoName "notification"
New-NestModule -Slug "promotions"    -DtoName "promotion"
New-NestModule -Slug "revenus"       -DtoName "revenu"
New-NestModule -Slug "admin"         -DtoName "signalement"

# ------------------------------------------------------------
# Module auth (cas particulier)
# ------------------------------------------------------------
Write-Host "Creation du module auth..."

New-FileWithContent "src/modules/auth/dto/login.dto.ts" @'
export class LoginDto {
  email: string;
  password: string;
}
'@

New-FileWithContent "src/modules/auth/dto/register.dto.ts" @'
export class RegisterDto {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}
'@

New-FileWithContent "src/modules/auth/strategies/jwt.strategy.ts" @'
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { id_user: payload.sub, role: payload.role };
  }
}
'@

New-FileWithContent "src/modules/auth/strategies/local.strategy.ts" @'
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    return this.authService.validateUser(email, password);
  }
}
'@

New-FileWithContent "src/modules/auth/auth.service.ts" @'
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
'@

New-FileWithContent "src/modules/auth/auth.controller.ts" @'
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    // TODO: creer l'utilisateur (bcrypt.hash du password) puis login
    return dto;
  }
}
'@

New-FileWithContent "src/modules/auth/auth.module.ts" @'
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: config.get('jwt.expiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
'@

# ------------------------------------------------------------
# app.module.ts
# ------------------------------------------------------------
Write-Host "Ecriture de app.module.ts..."

New-FileWithContent "src/app.module.ts" @'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './modules/auth/auth.module';
import { UtilisateursModule } from './modules/utilisateurs/utilisateurs.module';
import { BoutiquesModule } from './modules/boutiques/boutiques.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProduitsModule } from './modules/produits/produits.module';
import { PanierModule } from './modules/panier/panier.module';
import { FavorisModule } from './modules/favoris/favoris.module';
import { CommandesModule } from './modules/commandes/commandes.module';
import { PaiementsModule } from './modules/paiements/paiements.module';
import { AvisModule } from './modules/avis/avis.module';
import { MessagerieModule } from './modules/messagerie/messagerie.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { RevenusModule } from './modules/revenus/revenus.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    PrismaModule,
    AuthModule,
    UtilisateursModule,
    BoutiquesModule,
    CategoriesModule,
    ProduitsModule,
    PanierModule,
    FavorisModule,
    CommandesModule,
    PaiementsModule,
    AvisModule,
    MessagerieModule,
    NotificationsModule,
    PromotionsModule,
    RevenusModule,
    AdminModule,
  ],
})
export class AppModule {}
'@

# ------------------------------------------------------------
# .env.example
# ------------------------------------------------------------
New-FileWithContent ".env.example" @'
DATABASE_URL="mysql://user:password@localhost:3306/marketplace_db"
JWT_SECRET="change-moi-en-production"
JWT_EXPIRES_IN="1d"
PORT=3000
'@

Write-Host ""
Write-Host "============================================================"
Write-Host "Termine ! Arborescence generee dans src/, prisma/, uploads/"
Write-Host ""
Write-Host "Prochaines etapes :"
Write-Host "  1. npm install '@prisma/client'"
Write-Host "     npm install -D prisma"
Write-Host "  2. npm install '@nestjs/config' '@nestjs/jwt' '@nestjs/passport' passport passport-jwt passport-local bcrypt"
Write-Host "  3. Copy-Item .env.example .env   (puis renseigner DATABASE_URL)"
Write-Host "  4. Completer prisma/schema.prisma avec les 25 modeles"
Write-Host "  5. npx prisma migrate dev --name init"
Write-Host "  6. npm run start:dev"
Write-Host "============================================================"