import { Controller, Get,Query, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ProduitsService } from './produits.service';
import { CreateProduitDto } from './dto/create-produit.dto';

@Controller('produits')
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  @Post()
  create(@Body() dto: CreateProduitDto) {
    return this.produitsService.create(dto);
  }

  @Get()
  findAll() {
    return this.produitsService.findAll();
  }

@Get('similaires')
findSimilarProducts(
  @Query('shopId') shopId: string,
  @Query('id_categorie') idCategorie: string,
) {
  return this.produitsService.findSimilarProducts(
    Number(shopId),
    Number(idCategorie),
  );
}

@Get(':id/avis')
  getAvis(@Param('id') id: number) {
    return this.produitsService.getAvis(id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.produitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProduitDto>) {
    return this.produitsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produitsService.remove(+id);
  }
}
