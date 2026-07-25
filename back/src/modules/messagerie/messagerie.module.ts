import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessagerieController } from './messagerie.controller';
import { MessagerieGateway } from './messagerie.gateway';
import { MessagerieService } from './messagerie.service';

@Module({
  imports: [AuthModule],
  controllers: [MessagerieController],
  providers: [MessagerieService, MessagerieGateway],
  exports: [MessagerieService],
})
export class MessagerieModule {}
