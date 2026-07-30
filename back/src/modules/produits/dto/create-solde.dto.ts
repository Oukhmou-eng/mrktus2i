import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, Min } from 'class-validator';

enum SoldeReductionType {
  POURCENTAGE = 'pourcentage',
  MONTANT_FIXE = 'montant_fixe',
}

export class CreateSoldeDto {
  @IsEnum(SoldeReductionType)
  type_reduction: SoldeReductionType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valeur_reduction: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prix_promo: number;

  @IsDateString()
  date_debut: string;

  @IsDateString()
  date_fin: string;
}
