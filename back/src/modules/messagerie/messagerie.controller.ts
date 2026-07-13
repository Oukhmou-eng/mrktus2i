import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { MessagerieService } from './messagerie.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messagerie')
export class MessagerieController {
  constructor(private readonly messagerieService: MessagerieService) {}

  @Post()
  create(@Body() dto: CreateMessageDto) {
    return this.messagerieService.create(dto);
  }

  @Get()
  findAll() {
    return this.messagerieService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagerieService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateMessageDto>) {
    return this.messagerieService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagerieService.remove(+id);
  }
}
