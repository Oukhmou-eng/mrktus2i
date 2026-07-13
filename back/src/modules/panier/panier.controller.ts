import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PanierService } from './panier.service';
import { CreatePanierItemDto } from './dto/create-panier-item.dto';

@Controller('panier')
export class PanierController {
  constructor(private readonly panierService: PanierService) {}

  @Post()
  create(@Body() dto: CreatePanierItemDto) {
    return this.panierService.create(dto);
  }

  @Get()
  findAll() {
    return this.panierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.panierService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePanierItemDto>) {
    return this.panierService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.panierService.remove(+id);
  }
}
