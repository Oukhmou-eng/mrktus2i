import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Module({
  controllers: [HomeController],
  providers: [HomeService, OptionalJwtAuthGuard]
})
export class HomeModule {}
