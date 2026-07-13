import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateSignalementDto } from './dto/create-signalement.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() dto: CreateSignalementDto) {
    return this.adminService.create(dto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateSignalementDto>) {
    return this.adminService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
