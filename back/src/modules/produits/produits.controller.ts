import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { ProduitsService } from './produits.service';
import { CreateProduitDto } from './dto/create-produit.dto';

@Controller('produits')
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('medias', 20, { limits: { fileSize: 5 * 1024 * 1024 } }))
  async create(
    @Body() dto: CreateProduitDto,
    @UploadedFiles() files: Array<{ buffer: Buffer; originalname: string; mimetype: string }> = [],
  ) {
    const medias = await Promise.all(files.map((file, ordre) => this.saveMedia(file, ordre)));
    return this.produitsService.create(dto, medias);
  }

  private async saveMedia(file: { buffer: Buffer; originalname: string; mimetype: string }, ordre: number) {
    const type: 'image' | 'video' | null = file.mimetype.startsWith('video/') ? 'video' : file.mimetype.startsWith('image/') ? 'image' : null;
    if (!type) throw new BadRequestException('Seuls les fichiers image et vidéo sont autorisés.');

    const extension = extname(file.originalname).toLowerCase() || (type === 'video' ? '.mp4' : '.jpg');
    const filename = `${type}-${randomUUID()}${extension}`;
    const directory = join(process.cwd(), 'uploads', 'produits');
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), file.buffer);
    return { type, ordre, url: `http://localhost:${process.env.PORT || 3000}/uploads/produits/${filename}` };
  }

  @Get()
  findAll() {
    return this.produitsService.findAll();
  }

  @Get('similaires')
findSimilarProducts(
  @Query('shopId') shopId: string,
  @Query('id_categorie') idCategorie: string,
) {
  return this.produitsService.findSimilarProducts(
    Number(shopId),
    Number(idCategorie),
  );
}

  @Get(':id/mes-produits')
  getMesProduits(@Param('id') id: string) {
    return this.produitsService.getMesProduits(+id);
  }

@Get(':id/avis')
  getAvis(@Param('id') id: number) {
    return this.produitsService.getAvis(id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.produitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProduitDto>) {
    return this.produitsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produitsService.remove(+id);
  }
}
