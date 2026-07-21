import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const PRODUCT_STATUSES = ['brouillon', 'en_ligne', 'rupture', 'archive'] as const;

export class CreateProduitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  categorie: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  prix: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @Transform(({ value }) => value || 'en_ligne')
  @IsIn(PRODUCT_STATUSES)
  statut?: (typeof PRODUCT_STATUSES)[number];
}