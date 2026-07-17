import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AvisService } from './avis.service';
import { CreateAvisDto } from './dto/create-avis.dto';

@Controller('avis')
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Post()
  create(@Body() body:any) {
    return this.avisService.create(body.type_cible, body.id_cible ,body.note,body.commentaire,body.id_user );
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
