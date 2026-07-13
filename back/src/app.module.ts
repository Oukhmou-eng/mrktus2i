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
