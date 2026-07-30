import { IsEnum, IsInt, IsNotEmpty, IsNumber, Min, MinLength } from 'class-validator';

export class CreatePlanTarifDto {
  @IsNotEmpty()
  @MinLength(2)
  nom_plan!: string;

  @IsEnum(['produit', 'boutique'])
  type_cible!: 'produit' | 'boutique';

  @IsInt()
  @Min(1)
  duree_jours!: number;

  @IsNumber()
  @Min(0)
  prix!: number;

  @IsInt()
  @Min(0)
  priorite!: number;

  @IsEnum(['actif', 'inactif'])
  statut!: 'actif' | 'inactif';
}
