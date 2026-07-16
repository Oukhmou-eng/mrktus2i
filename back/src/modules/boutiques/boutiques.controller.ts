import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { BoutiquesService } from './boutiques.service';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';

@Controller('boutiques')
export class BoutiquesController {
  constructor(private readonly boutiquesService: BoutiquesService) {}

  @Post('trie')
  create(@Body()  body: any) {
    return this.boutiquesService.trie(body.Vtrie);
  }

  @Get()
  findAll() {
    return this.boutiquesService.findAll();
  }

  @Post('search')
  search(@Body() body: any) {
    return this.boutiquesService.search(body.search);
  }

  @Post('detail')
  findOne(@Body() body: any) {
    return this.boutiquesService.findOne(body.id);
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
