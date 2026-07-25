import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { UtilisateursService } from './utilisateurs.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  @Post()
  create(@Body() dto: CreateUtilisateurDto) {
    return this.utilisateursService.create(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  par(@CurrentUser() user: { id_user: number }) {
    return this.utilisateursService.par(user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @CurrentUser() user: { id_user: number },
    @Body() dto: Partial<CreateUtilisateurDto>,
  ) {
    return this.utilisateursService.updateMe(user.id_user, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  updatePassword(
    @CurrentUser() user: { id_user: number },
    @Body() body: { motDePasseActuel?: string; nouveauMotDePasse?: string },
  ) {
    return this.utilisateursService.updatePassword(
      user.id_user,
      body.motDePasseActuel ?? '',
      body.nouveauMotDePasse ?? '',
    );
  }
  @UseGuards(JwtAuthGuard)

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: 2 * 1024 * 1024 } }))
  async uploadAvatar(
    @CurrentUser() user: { id_user: number },
    @UploadedFile() file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Une image est requise.');
    }

    const extension = extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `avatar-${randomUUID()}${extension}`;
    const directory = join(process.cwd(), 'uploads', 'utilisateurs');
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), file.buffer);

    const logoUrl = `http://localhost:${process.env.PORT || 3000}/uploads/utilisateurs/${filename}`;
    return this.utilisateursService.updateLogoUrl(user.id_user, logoUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/avatar')
  removeAvatar(@CurrentUser() user: { id_user: number }) {
    return this.utilisateursService.updateLogoUrl(user.id_user, null);
  }
  @Get()
  findAll() {
    return this.utilisateursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.utilisateursService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateUtilisateurDto>) {
    return this.utilisateursService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.utilisateursService.remove(+id);
  }







  


}
