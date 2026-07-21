import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CommandesService } from './commandes.service';
import { CreateCommandeDto } from './dto/create-commande.dto';

@Controller('commandes')
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


  @Get('utilisateur/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.commandesService.findByUser(+userId);
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
