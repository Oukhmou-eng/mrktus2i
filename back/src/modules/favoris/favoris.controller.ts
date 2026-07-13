import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { FavorisService } from './favoris.service';
import { CreateFavoriDto } from './dto/create-favori.dto';

@Controller('favoris')
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}

  @Post()
  create(@Body() dto: CreateFavoriDto) {
    return this.favorisService.create(dto);
  }

  @Get()
  findAll() {
    return this.favorisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favorisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateFavoriDto>) {
    return this.favorisService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favorisService.remove(+id);
  }
}
