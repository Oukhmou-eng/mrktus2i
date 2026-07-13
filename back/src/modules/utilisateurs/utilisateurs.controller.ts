import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  @Post()
  create(@Body() dto: CreateUtilisateurDto) {
    return this.utilisateursService.create(dto);
  }

  @Get()
  findAll() {
    return this.utilisateursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.utilisateursService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateUtilisateurDto>) {
    return this.utilisateursService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.utilisateursService.remove(+id);
  }
}
