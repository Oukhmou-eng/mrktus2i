import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { BoutiquesService } from './boutiques.service';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';

@Controller('boutiques')
export class BoutiquesController {
  constructor(private readonly boutiquesService: BoutiquesService) {}

  @Post()
  create(@Body() dto: CreateBoutiqueDto) {
    return this.boutiquesService.create(dto);
  }

  @Get()
  findAll() {
    return this.boutiquesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boutiquesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateBoutiqueDto>) {
    return this.boutiquesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boutiquesService.remove(+id);
  }
}
