import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { RevenusService } from './revenus.service';
import { CreateRevenuDto } from './dto/create-revenu.dto';

@Controller('revenus')
export class RevenusController {
  constructor(private readonly revenusService: RevenusService) {}

  @Post()
  create(@Body() dto: CreateRevenuDto) {
    return this.revenusService.create(dto);
  }

  @Get()
  findAll() {
    return this.revenusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.revenusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRevenuDto>) {
    return this.revenusService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.revenusService.remove(+id);
  }
}
