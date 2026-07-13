import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AvisService } from './avis.service';
import { CreateAvisDto } from './dto/create-avis.dto';

@Controller('avis')
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Post()
  create(@Body() dto: CreateAvisDto) {
    return this.avisService.create(dto);
  }

  @Get()
  findAll() {
    return this.avisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.avisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateAvisDto>) {
    return this.avisService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.avisService.remove(+id);
  }
}
