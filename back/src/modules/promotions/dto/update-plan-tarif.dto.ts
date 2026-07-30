import { IsEnum, IsInt, IsNumber, IsOptional, Min, MinLength } from 'class-validator';

export class UpdatePlanTarifDto {
  @IsOptional()
  @MinLength(2)
  nom_plan?: string;

  @IsOptional()
  @IsEnum(['produit', 'boutique'])
  type_cible?: 'produit' | 'boutique';

  @IsOptional()
  @IsInt()
  @Min(1)
  duree_jours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prix?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priorite?: number;

  @IsOptional()
  @IsEnum(['actif', 'inactif'])
  statut?: 'actif' | 'inactif';
}
