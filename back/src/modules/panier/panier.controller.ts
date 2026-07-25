import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PanierService } from './panier.service';
import { CreatePanierItemDto } from './dto/create-panier-item.dto';

class UpdatePanierQuantityDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantite: number;
}

@Controller('panier')
export class PanierController {
  constructor(private readonly panierService: PanierService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@CurrentUser() user: { id_user: number }) {
    return this.panierService.findByUser(user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('enregistres')
  getSaved(@CurrentUser() user: { id_user: number }) {
    return this.panierService.findSavedByUser(user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id_user: number }, @Body() dto: CreatePanierItemDto) {
    return this.panierService.create({ ...dto, id_user: user.id_user });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateQuantity(
    @CurrentUser() user: { id_user: number },
    @Param('id') id: string,
    @Body() dto: UpdatePanierQuantityDto,
  ) {
    return this.panierService.updateQuantity(+id, user.id_user, dto.quantite);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @CurrentUser() user: { id_user: number },
    @Param('id') id: string,
  ) {
    return this.panierService.remove(+id, user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/enregistrer')
  saveForLater(
    @CurrentUser() user: { id_user: number },
    @Param('id') id: string,
  ) {
    return this.panierService.saveForLater(+id, user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/restaurer')
  restoreFromSaved(
    @CurrentUser() user: { id_user: number },
    @Param('id') id: string,
  ) {
    return this.panierService.restoreFromSaved(+id, user.id_user);
  }
}

