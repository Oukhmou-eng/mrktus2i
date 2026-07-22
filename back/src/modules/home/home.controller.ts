import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  getHomeData(@CurrentUser() user: { id_user: number } | null) {
    return this.homeService.getHomeData(user?.id_user);
  }
}
