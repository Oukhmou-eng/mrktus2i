import { Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FavorisService } from './favoris.service';

@Controller('favoris')
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':produitId')
  addFavori(
    @CurrentUser() user: { id_user: number },
    @Param('produitId', ParseIntPipe) produitId: number,
  ) {
    return this.favorisService.addFavori(user.id_user, produitId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMesFavoris(@CurrentUser() user: { id_user: number }) {
    return this.favorisService.getFav(user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':produitId')
  removeFavori(
    @CurrentUser() user: { id_user: number },
    @Param('produitId', ParseIntPipe) produitId: number,
  ) {
    return this.favorisService.removeFavori(user.id_user, produitId);
  }
}
