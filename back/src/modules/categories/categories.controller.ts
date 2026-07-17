import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import {  Query } from '@nestjs/common';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('filtre')
  filtre(@Body() Body: any) {
    return this.categoriesService.filtre(Body.search,Body.categories,Body.priceRanges,Body.minRating,Body.conditions,Body.sort,Body.page);
  }
  @Post('search')
  findSearch(@Body() body: any) {
    return this.categoriesService.findSearch( body.search );
  }

  @Get()
findAll() {
  return this.categoriesService.findAll();
}
  @Get('soldes')
findSoldes(
  @Query('page') page?: string,
) {
  return this.categoriesService.findSoldes(Number(page) || 1);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCategorieDto>) {
    return this.categoriesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
