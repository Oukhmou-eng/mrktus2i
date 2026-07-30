import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CommandesService } from './commandes.service';
import { CreateCommandeDto } from './dto/create-commande.dto';

@Controller('commandes')
@UseGuards(JwtAuthGuard)
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  @Post()
  create(@Body() dto: CreateCommandeDto) {
    return this.commandesService.create(dto);
  }

  @Get()
  findAll() {
    return this.commandesService.findAll();
  }

  @Post('statistiques')
  getStatistics(
    @Body() body: { periode?: number },
    @CurrentUser() user: { id_user: number; id_boutique?: number },
  ) {
    return this.commandesService.getStatistics(user, body.periode ?? 7);
  }

  @Get('utilisateur/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.commandesService.findByUser(+userId);
  }

  @Get('boutique/:boutiqueId')
  findByBoutique(@Param('boutiqueId') boutiqueId: string, @Req() req: any) {
    return this.commandesService.findByBoutique(+boutiqueId, req.user?.id_user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCommandeDto>) {
    return this.commandesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandesService.remove(+id);
  }
}
