import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { BoutiquesService } from './boutiques.service';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('boutiques')
export class BoutiquesController {
  constructor(private readonly boutiquesService: BoutiquesService) {}
 @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'banniere', maxCount: 1 },
  ], { limits: { fileSize: 5 * 1024 * 1024 } }))
  async create(
     @CurrentUser() user: { id_user: number },
    @Body() dto: CreateBoutiqueDto,
    @UploadedFiles() files: Record<string, Array<{ buffer: Buffer; originalname: string; mimetype: string }>>,
  ) {
    dto.logo_url = await this.saveImage(files?.logo?.[0], 'logo');
    dto.banniere_url = await this.saveImage(files?.banniere?.[0], 'banniere');
    return this.boutiquesService.create(user.id_user,dto);
  }

  private async saveImage(file: { buffer: Buffer; originalname: string; mimetype: string } | undefined, prefix: string) {
    if (!file) return undefined;
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Seules les images sont autorisées.');
    const extension = extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${prefix}-${randomUUID()}${extension}`;
    const directory = join(process.cwd(), 'uploads', 'boutiques');
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), file.buffer);
    return `http://localhost:${process.env.PORT || 3000}/uploads/boutiques/${filename}`;
  }






  @Post('trie')
  trie(@Body() body: any) {
    return this.boutiquesService.trie(body.Vtrie);
  }

  @Post('tries')
  tries(@Body() body: any) {
    return this.boutiquesService.tries(body.Vtrie, body.id);
  }

  @Get()
  findAll() {
    return this.boutiquesService.findAll();
  }

@UseGuards(JwtAuthGuard)
@Get(':boutiqueId/suiviestest')
checkFollow(
  @CurrentUser() user: { id_user: number },
  @Param('boutiqueId') boutiqueId: string,
) {
  return this.boutiquesService.checkFollow(user.id_user, +boutiqueId);
}



 @UseGuards(JwtAuthGuard)
  @Post('suiviess')
  getFollowed(
    @CurrentUser() user: { id_user: number },
   
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.boutiquesService.getBS(user.id_user, search, sort);
  }










  @UseGuards(JwtAuthGuard)
  @Delete(':boutiqueId/suivies')
  removeFollow(
    @CurrentUser() user: { id_user: number },
    @Param('boutiqueId') boutiqueId: string,
  ) {
    return this.boutiquesService.removeFollow(user.id_user, +boutiqueId);
  }



 @UseGuards(JwtAuthGuard)
  @Post(':boutiqueId/suivies')
  addFollow(
    @CurrentUser() user: { id_user: number },
    
    @Param('boutiqueId') boutiqueId: string,
  ) {
    return this.boutiquesService.addFollow(user.id_user, +boutiqueId);
  }






  @Get(':id/avis')
  getAvis(@Param('id') id: string) {
    return this.boutiquesService.getAvis(+id);
  }

  @Post('search')
  search(@Body() body: any) {
    return this.boutiquesService.search(body.search);
  }

  @Post('detail')
  findOne(@Body() body: any) {
    return this.boutiquesService.findOne(body.id);
  }

  @Post('signale')
  signaler(@Body() body: any) {
    return this.boutiquesService.signaler(body.id, body.motif, body.description);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avis')
  ajouterAvisDepuisBoutique(
    @Body() body: { id: number; note: number; commentaire: string },
    @CurrentUser() user: { id_user: number },
  ) {
    return this.boutiquesService.ajouterAvis(
      +body.id,
      body.note,
      body.commentaire,
      user.id_user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/avis')
  ajouterAvis(
    @Param('id') id: string,
    @Body() body: { note: number; commentaire: string },
    @CurrentUser() user: { id_user: number },
  ) {
    return this.boutiquesService.ajouterAvis(+id, body.note, body.commentaire, user.id_user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateBoutiqueDto>) {
    return this.boutiquesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boutiquesService.remove(+id);
  }


  @UseGuards(JwtAuthGuard)
@Get('mes-boutiques')
getMesBoutiques(@CurrentUser() user: { id_user: number }) {
  return this.boutiquesService.getMesBoutiques(user.id_user);
}



  @UseGuards(JwtAuthGuard)
@Get('mes-boutiques/:id')
getMesBoutiquesid(
  @CurrentUser() user: { id_user: number },
  @Param('id') id: number,
) {
  return this.boutiquesService.getMesBoutiquesid(user.id_user, id);
}
}
