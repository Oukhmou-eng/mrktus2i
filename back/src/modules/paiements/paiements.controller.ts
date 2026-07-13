import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';

@Controller('paiements')
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  @Post()
  create(@Body() dto: CreatePaiementDto) {
    return this.paiementsService.create(dto);
  }

  @Get()
  findAll() {
    return this.paiementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paiementsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePaiementDto>) {
    return this.paiementsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paiementsService.remove(+id);
  }
}
